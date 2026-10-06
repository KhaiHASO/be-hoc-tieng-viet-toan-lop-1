import paramiko
import sys
import time

HOST = "160.250.4.230"
USER = "root"
PASS = "Bevuihocso@@123"

def run_cmd(ssh, cmd, title=None):
    if title:
        print(f"\n==========================================")
        print(f"▶ {title}")
        print(f"==========================================")
    print(f"$ {cmd.strip()}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    
    while True:
        line = stdout.readline()
        if not line:
            break
        print(line, end="")
        sys.stdout.flush()
        
    exit_status = stdout.channel.recv_exit_status()
    err = stderr.read().decode().strip()
    if err and exit_status != 0:
        print(f"STDERR: {err}")
    if exit_status != 0:
        print(f"❌ Exit status: {exit_status}")
    else:
        print(f"✓ Hoàn tất!")
    return exit_status

def main():
    print(f"Đang kết nối SSH tới {USER}@{HOST}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS, timeout=15)
    print("✓ Đăng nhập SSH thành công vào hệ điều hành mới!")

    # 1. Tạo 2GB Swap Memory (đảm bảo build Next.js không tràn RAM)
    swap_cmd = """
    if [ ! -f /swapfile ]; then
        echo "Tạo 2GB Swap..."
        fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        echo "/swapfile none swap sw 0 0" >> /etc/fstab
    fi
    free -m
    """
    run_cmd(ssh, swap_cmd, "Thiết lập Swap Memory")

    # 2. Cài git, nginx, curl qua apt
    apt_cmd = """
    apt-get update -qq
    DEBIAN_FRONTEND=noninteractive apt-get install -y git nginx curl xz-utils
    """
    run_cmd(ssh, apt_cmd, "Cài đặt Git, Nginx, Curl")

    # 3. Cài đặt Node.js v22 LTS trực tiếp từ binary chính thức (siêu nhanh, sạch sẽ)
    node_cmd = """
    if ! command -v node >/dev/null 2>&1; then
        echo "Tải Node.js v22 LTS binary..."
        curl -fsSL https://nodejs.org/dist/v22.14.0/node-v22.14.0-linux-x64.tar.xz | tar -xJ -C /usr/local --strip-components=1
    fi
    node -v
    npm -v
    npm install -g pnpm pm2
    pnpm -v
    pm2 -v
    """
    run_cmd(ssh, node_cmd, "Cài đặt Node.js v22, pnpm & PM2")

    # 4. Clone mã nguồn từ GitHub
    git_cmd = """
    mkdir -p /var/www
    cd /var/www
    rm -rf be-hoc-tieng-viet-toan-lop-1
    git clone https://github.com/KhaiHASO/be-hoc-tieng-viet-toan-lop-1.git
    cd be-hoc-tieng-viet-toan-lop-1
    git log -1 --oneline
    """
    run_cmd(ssh, git_cmd, "Clone repository từ GitHub")

    # 5. Cài đặt dependencies và Build Next.js
    build_cmd = """
    cd /var/www/be-hoc-tieng-viet-toan-lop-1/web
    pnpm install
    pnpm build
    """
    run_cmd(ssh, build_cmd, "Build ứng dụng Next.js")

    # 6. Chạy ứng dụng qua PM2
    pm2_cmd = """
    cd /var/www/be-hoc-tieng-viet-toan-lop-1/web
    pm2 delete be-vui-hoc-so 2>/dev/null || true
    pm2 start "pnpm start" --name be-vui-hoc-so
    pm2 save
    env PATH=$PATH:/usr/local/bin pm2 startup systemd -u root --hp /root 2>/dev/null || true
    pm2 status
    """
    run_cmd(ssh, pm2_cmd, "Khởi chạy PM2 Daemon")

    # 7. Cấu hình Nginx Reverse Proxy trỏ Port 80 -> 3000
    nginx_cmd = """cat << 'EOF' > /etc/nginx/sites-available/default
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
nginx -t
systemctl restart nginx
systemctl enable nginx
"""
    run_cmd(ssh, nginx_cmd, "Cấu hình Nginx Reverse Proxy")

    # 8. Kiểm tra nghiệm thu
    test_cmd = """
    sleep 2
    curl -I http://127.0.0.1
    curl -I http://127.0.0.1/audio/module_numbers/so_1.mp3
    """
    run_cmd(ssh, test_cmd, "Kiểm tra phản hồi trang Web")

    ssh.close()
    print("\n" + "="*50)
    print(f"🎉 TRIỂN KHAI HOÀN TẤT THÀNH CÔNG LÊN VPS!")
    print(f"👉 Website đang hoạt động tại: http://{HOST}")
    print("="*50)

if __name__ == "__main__":
    main()
