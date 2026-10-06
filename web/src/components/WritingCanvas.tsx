"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { NumberCardData } from "@/types/number";
import { PenTool, RotateCcw, AlertCircle, Eye, EyeOff, CheckCircle2, Volume2, Undo2, Sparkles } from "lucide-react";
import { sound } from "@/utils/speech";
import confetti from "canvas-confetti";

interface WritingCanvasProps {
  card: NumberCardData;
}

export const WritingCanvas: React.FC<WritingCanvasProps> = ({ card }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [penColor, setPenColor] = useState<string>("#7c3aed"); // Tím học sinh tiểu học
  const [ghostMode, setGhostMode] = useState<"card" | "font" | "none">("card");
  const [lineWidth, setLineWidth] = useState<number>(8);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);

  // Lưu lịch sử các nét vẽ để có thể Hoàn tác (Undo)
  const historyRef = useRef<ImageData[]>([]);

  const writingGuideImg = `/data/module_numbers/${card.assets.writing_guide.replace("assets/", "")}`;

  // Vẽ lưới ô ly tiểu học lên canvas
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    // Nền trắng
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Vẽ lưới ô ly tiểu học (4 đường kẻ ngang chính, các đường dọc)
    const gridSize = 40;
    ctx.lineWidth = 1;

    // Đường lưới dọc
    for (let x = 0; x <= width; x += gridSize) {
      ctx.strokeStyle = x % (gridSize * 4) === 0 ? "#94a3b8" : "#f1f5f9";
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Đường kẻ ngang
    for (let y = 0; y <= height; y += gridSize) {
      const isMajor = y % (gridSize * 4) === 0;
      ctx.strokeStyle = isMajor ? "#60a5fa" : "#e2e8f0";
      ctx.lineWidth = isMajor ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Dòng kẻ đậm chân chữ số (Baseline chuẩn vở ô ly)
    const baselineY = height - gridSize * 2.5;
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, baselineY);
    ctx.lineTo(width, baselineY);
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawGrid(ctx, canvas.width, canvas.height);
    historyRef.current = [];
    setHasDrawn(false);
  };

  // Hoàn tác nét vẽ gần nhất
  const undoLastStroke = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (historyRef.current.length > 0) {
      const previousState = historyRef.current.pop();
      if (previousState) {
        ctx.putImageData(previousState, 0, 0);
      }
      if (historyRef.current.length === 0) {
        setHasDrawn(false);
      }
    } else {
      clearCanvas();
    }
  };

  useEffect(() => {
    clearCanvas();
  }, [card.number]);

  // CHUYỂN ĐỔI TỌA ĐỘ CẢM ỨNG CHÍNH XÁC (Khắc phục lỗi lệch ngón tay trên điện thoại)
  const getCanvasCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    // Tỉ lệ scale thực giữa kích thước hiển thị CSS và độ phân giải thực của Canvas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Bắt đầu chạm/nhấp bút
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // bỏ qua nếu browser không hỗ trợ pointer capture
    }

    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    // Lưu lại trạng thái canvas trước nét vẽ mới để Undo
    try {
      const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
      if (historyRef.current.length >= 20) {
        historyRef.current.shift(); // giới hạn tối đa 20 bước hoàn tác
      }
      historyRef.current.push(currentState);
    } catch {}

    setIsDrawing(true);
    setHasDrawn(true);

    // Chấm điểm tròn tức thì khi chạm ngón tay (cho phép chấm điểm đặt bút)
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, lineWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = penColor;
    ctx.fill();

    // Mở đường nét liên tục
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = penColor;
    ctx.lineWidth = lineWidth;
  };

  // Di chuyển ngón tay / chuột
  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    // Tiếp nối điểm để nét vẽ tròn và mượt không bị đứt đoạn
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = penColor;
    ctx.lineWidth = lineWidth;
  };

  // Nhấc tay / kết thúc nét
  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && e.pointerId) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  return (
    <div className="flex flex-col max-w-5xl mx-auto py-6">
      {/* Tiêu đề */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-100 text-purple-800 font-bold text-xs uppercase tracking-wider mb-2">
            <PenTool className="w-4 h-4 text-purple-600" />
            Luyện Viết Đúng Quy Chuẩn Tiểu Học
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
            Hướng Dẫn & Tập Viết Chữ Số {card.number}
          </h2>
        </div>

        <button
          onClick={() => sound.playTeacherAudio(card.assets.audio_url)}
          className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-300 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-xs"
        >
          <Volume2 className="w-4 h-4 text-purple-700" />
          <span>Nghe Cô Giáo Đọc & Hướng Dẫn Nét</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CỘT TRÁI (5 cột): Mẫu nét đứt và các bước quy chuẩn */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Ảnh Mẫu Nét Đứt Gốc */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Mẫu nét đứt & mũi tên chỉ hướng
            </h3>
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 border-2 border-dashed border-purple-200 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center">
              <Image
                src={writingGuideImg}
                alt={`Mẫu viết số ${card.number}`}
                fill
                className="object-contain p-2"
              />
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full mt-3">
              Chữ số {card.number} gồm {card.writing_guide.stroke_count} nét (cao 2 ô ly)
            </span>
          </div>

          {/* Quy trình đi nét */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h4 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Các bước đi nét theo chuẩn:
            </h4>
            <div className="flex flex-col gap-2.5">
              {card.writing_guide.steps.map((step, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-xs sm:text-sm text-slate-700">
                  <span className="font-bold text-purple-800 mr-1.5">{idx + 1}.</span>
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Cảnh báo lỗi thường gặp */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Lỗi trẻ hay mắc phải:</span> {card.writing_guide.common_mistakes}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (7 cột): Bảng vẽ Canvas tương tác (Interactive Canvas) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col">
            {/* Thanh công cụ bảng vẽ */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Mực bút:</span>
                {[
                  { color: "#7c3aed", name: "Tím" },
                  { color: "#2563eb", name: "Xanh" },
                  { color: "#dc2626", name: "Đỏ" },
                ].map((c) => (
                  <button
                    key={c.color}
                    onClick={() => setPenColor(c.color)}
                    style={{ backgroundColor: c.color }}
                    className={`w-7 h-7 rounded-full shadow-sm transition-transform active:scale-90 ${
                      penColor === c.color ? "ring-4 ring-offset-2 ring-purple-300 scale-110" : ""
                    }`}
                    title={`Mực ${c.name}`}
                  />
                ))}

                <span className="text-xs font-bold text-slate-400 ml-2 hidden sm:inline">Cỡ nét:</span>
                {[5, 8, 12].map((w) => (
                  <button
                    key={w}
                    onClick={() => setLineWidth(w)}
                    className={`px-2 py-0.5 rounded-md text-xs font-bold hidden sm:inline ${
                      lineWidth === w ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {w === 5 ? "Mảnh" : w === 8 ? "Vừa" : "Đậm"}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Nút Hoàn tác (Undo) */}
                <button
                  onClick={undoLastStroke}
                  disabled={!hasDrawn}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    hasDrawn
                      ? "bg-purple-100 hover:bg-purple-200 text-purple-800"
                      : "bg-slate-100 text-slate-300 cursor-not-allowed"
                  }`}
                  title="Lùi lại 1 nét trước"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Hoàn tác</span>
                </button>

                {/* Chế độ mẫu mờ */}
                <button
                  onClick={() => {
                    if (ghostMode === "card") setGhostMode("font");
                    else if (ghostMode === "font") setGhostMode("none");
                    else setGhostMode("card");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors bg-purple-50 text-purple-700 border-purple-200"
                  title="Đổi chế độ mẫu đè mờ (Mẫu nét đứt / Chữ in / Tắt)"
                >
                  {ghostMode !== "none" ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>
                    {ghostMode === "card" && "Mẫu nét đứt"}
                    {ghostMode === "font" && "Chữ số in mờ"}
                    {ghostMode === "none" && "Không mẫu"}
                  </span>
                </button>

                {/* Xóa bảng */}
                <button
                  onClick={clearCanvas}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </button>

                {/* Khen thưởng khi hoàn thành */}
                {hasDrawn && (
                  <button
                    onClick={() => {
                      confetti({
                        particleCount: 80,
                        spread: 70,
                        origin: { y: 0.6 },
                      });
                      sound.playSuccessSound();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shadow-sm transition-all active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Viết xong! 🎉</span>
                  </button>
                )}
              </div>
            </div>

            {/* Khung vẽ Canvas có Lưới Ô Ly - touchAction none ngăn trình duyệt cuộn khi vẽ */}
            <div
              className="relative mt-4 w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-300 shadow-inner bg-white select-none"
              style={{ touchAction: "none" }}
            >
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                style={{ touchAction: "none" }}
                className="w-full h-full cursor-crosshair touch-none select-none block"
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerCancel={stopDrawing}
                onPointerLeave={stopDrawing}
              />

              {/* Lớp hiển thị nét mẫu đè mờ (Ghost overlay) */}
              {ghostMode === "card" && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 select-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={writingGuideImg}
                    alt=""
                    className="w-full h-full object-contain mix-blend-multiply opacity-35 select-none"
                  />
                </div>
              )}

              {ghostMode === "font" && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none opacity-20">
                  <span className="font-serif font-black text-[180px] sm:text-[240px] md:text-[280px] text-slate-800 leading-none select-none">
                    {card.number}
                  </span>
                </div>
              )}
            </div>

            <p className="text-center text-xs text-slate-400 mt-3">
              💡 Bé có thể dùng đầu ngón tay trên điện thoại / iPad hoặc chuột máy tính để tập đồ nét theo mẫu trên lưới ô ly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
