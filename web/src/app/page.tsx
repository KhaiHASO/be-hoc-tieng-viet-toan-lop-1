"use client";

import React, { useState } from "react";
import rawNumbersData from "@/data/numbers.json";
import { NumberCardData } from "@/types/number";
import { Navbar, Mode } from "@/components/Navbar";
import { FlashcardView } from "@/components/FlashcardView";
import { CountingGame } from "@/components/CountingGame";
import { NumberBondsInteractive } from "@/components/NumberBondsInteractive";
import { WritingCanvas } from "@/components/WritingCanvas";
import { ParentGuideView } from "@/components/ParentGuideView";
import { Sparkles, ArrowRight, ShieldCheck, Heart } from "lucide-react";
import { sound } from "@/utils/speech";

const numbers: NumberCardData[] = rawNumbersData as NumberCardData[];

export default function HomePage() {
  const [currentNumber, setCurrentNumber] = useState<NumberCardData>(numbers[0]);
  const [currentMode, setCurrentMode] = useState<Mode>("card");

  // Dữ liệu cấu trúc JSON-LD để AI & Search Engine đọc hiểu bài toán giáo dục
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Làm Quen Với Số Học & Tách Gộp Số Lớp 1",
    description: "Bộ học liệu số hóa gồm 10 thẻ học (Thẻ 71 đến 80), hướng dẫn nhận diện số, tập đếm số lượng và sơ đồ tách gộp số chuẩn Bộ Giáo Dục.",
    provider: {
      "@type": "Organization",
      name: "Dự Án Học Liệu Tiếng Việt & Toán Tiểu Học",
    },
    educationalLevel: "Tiền tiểu học / Lớp 1",
    inLanguage: "vi",
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50/40 via-white to-slate-50">
      {/* Schema.org JSON-LD cho bot AI & Google Crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Thanh điều hướng chính */}
      <Navbar
        numbers={numbers}
        currentNumber={currentNumber}
        onSelectNumber={(num) => setCurrentNumber(num)}
        currentMode={currentMode}
        onChangeMode={(mode) => setCurrentMode(mode)}
      />

      {/* Banner thông tin số hiện tại */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Thanh trạng thái nhanh */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs mb-6">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-100 text-rose-700 font-black text-sm">
              #{currentNumber.number}
            </span>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Đang học Thẻ {currentNumber.card_id}
              </p>
              <p className="text-base font-black text-slate-800 capitalize">
                {currentNumber.word} • {currentNumber.count} {currentNumber.item_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Nút chuyển nhanh số trước / sau */}
            <button
              disabled={currentNumber.number <= 1}
              onClick={() => {
                const prev = numbers.find((n) => n.number === currentNumber.number - 1);
                if (prev) {
                  setCurrentNumber(prev);
                }
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Số trước
            </button>
            <button
              disabled={currentNumber.number >= 10}
              onClick={() => {
                const next = numbers.find((n) => n.number === currentNumber.number + 1);
                if (next) {
                  setCurrentNumber(next);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <span>Số tiếp theo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Nội dung theo Chế độ được chọn */}
        {currentMode === "card" && <FlashcardView card={currentNumber} />}
        {currentMode === "counting" && <CountingGame card={currentNumber} />}
        {currentMode === "bonds" && <NumberBondsInteractive card={currentNumber} />}
        {currentMode === "writing" && <WritingCanvas card={currentNumber} />}
        {currentMode === "parent" && (
          <ParentGuideView numbers={numbers} currentNumber={currentNumber} />
        )}
      </main>

      {/* Chân trang */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold text-slate-700">Dự Án Học Liệu Tiếng Việt & Toán Tiền Tiểu Học</span>
            <span>• Module 4 (Thẻ 71 – 80)</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% Học liệu độc lập (Đã gỡ sạch mã QR bên thứ 3)
            </span>
            <span className="hidden md:inline text-slate-300">|</span>
            <span className="flex items-center gap-1 text-slate-400">
              Đồng hành cùng bé vào Lớp 1 <Heart className="w-3.5 h-3.5 text-rose-400" />
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
