"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { NumberCardData, NumberBond } from "@/types/number";
import { Split, Sparkles, HelpCircle, CheckCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { sound } from "@/utils/speech";
import confetti from "canvas-confetti";

interface NumberBondsInteractiveProps {
  card: NumberCardData;
}

export const NumberBondsInteractive: React.FC<NumberBondsInteractiveProps> = ({ card }) => {
  const [selectedBond, setSelectedBond] = useState<NumberBond>(card.all_bonds[1] || card.all_bonds[0]);
  const [quizMode, setQuizMode] = useState<boolean>(false);
  const [quizMissingBranch, setQuizMissingBranch] = useState<"a" | "b">("b");
  const [quizSelectedAnswer, setQuizSelectedAnswer] = useState<number | null>(null);
  const [quizStatus, setQuizStatus] = useState<"idle" | "correct" | "wrong">("idle");

  useEffect(() => {
    const defaultBond = card.all_bonds.find((b) => b.part_a === 1) || card.all_bonds[0];
    setSelectedBond(defaultBond);
    setQuizSelectedAnswer(null);
    setQuizStatus("idle");
  }, [card.number]);

  const animalImg = card.assets.single_animal
    ? `/data/module_numbers/${card.assets.single_animal.replace("assets/", "")}`
    : `/data/module_numbers/${card.assets.illustration.replace("assets/", "")}`;

  // Kiểm tra câu trả lời trong chế độ đố vui
  const handleAnswerQuiz = (val: number) => {
    setQuizSelectedAnswer(val);
    const expected = quizMissingBranch === "b" ? selectedBond.part_b : selectedBond.part_a;

    if (val === expected) {
      setQuizStatus("correct");
      sound.playSuccessSound();
      confetti({ particleCount: 100, spread: 60 });
    } else {
      setQuizStatus("wrong");
    }
  };

  return (
    <div className="flex flex-col max-w-5xl mx-auto py-6">
      {/* Header Chế độ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-2">
            <Split className="w-4 h-4 text-emerald-600" />
            Tư Duy Tách - Gộp Toán Lớp 1
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
            Cấu tạo và Tách - Gộp Số {card.number}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setQuizMode(false);
              setQuizStatus("idle");
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              !quizMode ? "bg-emerald-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Khám phá Tách - Gộp
          </button>
          <button
            onClick={() => {
              setQuizMode(true);
              setQuizSelectedAnswer(null);
              setQuizStatus("idle");
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              quizMode ? "bg-amber-500 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Đố Vui Điền Số
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CỘT TRÁI (7 cột): Sơ đồ nhánh trực quan & Rổ đồ vật */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Sơ đồ nhánh Number Bonds */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col items-center">
            <div className="relative w-full max-w-sm aspect-[4/3] flex items-center justify-center">
              {/* Vòng tròn Tổng (Gốc) */}
              <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-rose-500 bg-rose-50 flex flex-col items-center justify-center shadow-lg">
                  <span className="text-3xl sm:text-4xl font-black text-rose-600">{card.number}</span>
                </div>
                <span className="text-xs font-bold text-slate-400 mt-1 uppercase">Tổng</span>
              </div>

              {/* Đường nhánh nối (SVG) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 380 280">
                <path
                  d="M 120 140 C 180 140, 200 70, 260 70"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="4"
                  strokeDasharray="6 6"
                />
                <path
                  d="M 120 140 C 180 140, 200 210, 260 210"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="4"
                  strokeDasharray="6 6"
                />
              </svg>

              {/* Nhánh con A (Phía trên) */}
              <div className="absolute right-6 top-8 flex flex-col items-center">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-4 border-blue-500 bg-blue-50 flex flex-col items-center justify-center shadow-md">
                  {quizMode && quizMissingBranch === "a" && quizStatus !== "correct" ? (
                    <span className="text-2xl font-black text-amber-500 animate-pulse">?</span>
                  ) : (
                    <span className="text-2xl sm:text-3xl font-black text-blue-600">{selectedBond.part_a}</span>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-400 mt-1 uppercase">Phần 1</span>
              </div>

              {/* Nhánh con B (Phía dưới) */}
              <div className="absolute right-6 bottom-8 flex flex-col items-center">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-4 border-emerald-500 bg-emerald-50 flex flex-col items-center justify-center shadow-md">
                  {quizMode && quizMissingBranch === "b" && quizStatus !== "correct" ? (
                    <span className="text-2xl font-black text-amber-500 animate-pulse">?</span>
                  ) : (
                    <span className="text-2xl sm:text-3xl font-black text-emerald-600">{selectedBond.part_b}</span>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-400 mt-1 uppercase">Phần 2</span>
              </div>
            </div>

            {/* Hai câu khẩu quyết hiển thị trang trọng */}
            <div className="w-full mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-around gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-sm shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{selectedBond.split_sentence}</span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-sm shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>{selectedBond.combine_sentence}</span>
              </div>
            </div>
          </div>

          {/* Rổ đồ vật trực quan hóa số lượng chia vào 2 nhóm */}
          <div className="bg-gradient-to-r from-blue-50/60 to-emerald-50/60 rounded-3xl p-5 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
              Trực quan hóa số lượng chia vào 2 rổ
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Rổ A */}
              <div className="bg-white/90 rounded-2xl p-4 border border-blue-200 flex flex-col items-center">
                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full mb-2">
                  Rổ 1 ({selectedBond.part_a} {card.item_name})
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2 min-h-[70px]">
                  {Array.from({ length: selectedBond.part_a }).map((_, i) => (
                    <div key={i} className="relative w-8 h-8 sm:w-10 sm:h-10">
                      <Image src={animalImg} alt="con vật rổ 1" fill sizes="40px" className="object-contain" />
                    </div>
                  ))}
                  {selectedBond.part_a === 0 && (
                    <span className="text-xs text-slate-400 italic">Rổ rỗng (0)</span>
                  )}
                </div>
              </div>

              {/* Rổ B */}
              <div className="bg-white/90 rounded-2xl p-4 border border-emerald-200 flex flex-col items-center">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mb-2">
                  Rổ 2 ({selectedBond.part_b} {card.item_name})
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2 min-h-[70px]">
                  {Array.from({ length: selectedBond.part_b }).map((_, i) => (
                    <div key={i} className="relative w-8 h-8 sm:w-10 sm:h-10">
                      <Image src={animalImg} alt="con vật rổ 2" fill sizes="40px" className="object-contain" />
                    </div>
                  ))}
                  {selectedBond.part_b === 0 && (
                    <span className="text-xs text-slate-400 italic">Rổ rỗng (0)</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (5 cột): Danh sách chọn các thế tách gộp HOẶC Chế độ Đố vui */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {!quizMode ? (
            /* Danh sách các cặp tách gộp hoàn chỉnh */
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Tất cả các cách Tách - Gộp số {card.number}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Bấm vào từng dòng để xem sơ đồ tương ứng:
              </p>

              <div className="flex flex-col gap-2 max-h-[460px] overflow-y-auto pr-1">
                {card.all_bonds.map((bond, idx) => {
                  const isCurrent =
                    selectedBond.part_a === bond.part_a && selectedBond.part_b === bond.part_b;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedBond(bond)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                        isCurrent
                          ? "bg-emerald-50 border-emerald-400 shadow-sm ring-2 ring-emerald-200"
                          : "bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                            isCurrent ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{bond.split_sentence}</p>
                          <p className="text-xs text-slate-500">{bond.combine_sentence}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 shrink-0">
                        <span>{bond.part_a}</span>
                        <span className="text-slate-400">+</span>
                        <span>{bond.part_b}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Chế độ Đố Vui Điền Số */
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-200 shadow-sm">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-2">
                <HelpCircle className="w-4 h-4" />
                Câu đố phản xạ nhanh
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-1">
                Số {card.number} gồm {selectedBond.part_a} và mấy?
              </h3>
              <p className="text-xs text-slate-600 mb-6">
                Bé hãy bấm vào con số chính xác để điền vào dấu hỏi chấm nhé!
              </p>

              {/* Danh sách các đáp án lựa chọn */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {Array.from(
                  new Set([
                    selectedBond.part_b,
                    (selectedBond.part_b + 1) % (card.number + 1),
                    Math.max(0, selectedBond.part_b - 1),
                    (selectedBond.part_b + 2) % (card.number + 1),
                  ])
                )
                  .sort(() => Math.random() - 0.5)
                  .map((optionNum, i) => {
                    const isSelected = quizSelectedAnswer === optionNum;
                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswerQuiz(optionNum)}
                        className={`h-16 rounded-2xl font-black text-2xl border-2 transition-all transform active:scale-95 shadow-sm ${
                          isSelected
                            ? quizStatus === "correct"
                              ? "bg-emerald-500 border-emerald-600 text-white shadow-emerald-200"
                              : "bg-rose-500 border-rose-600 text-white shadow-rose-200"
                            : "bg-white hover:bg-amber-100 border-amber-300 text-slate-800"
                        }`}
                      >
                        {optionNum}
                      </button>
                    );
                  })}
              </div>

              {quizStatus === "correct" && (
                <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-sm font-bold">Chính xác! Bé xuất sắc lắm!</span>
                  </div>
                  <button
                    onClick={() => {
                      const nextBond = card.all_bonds[Math.floor(Math.random() * card.all_bonds.length)];
                      setSelectedBond(nextBond);
                      setQuizSelectedAnswer(null);
                      setQuizStatus("idle");
                    }}
                    className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    <span>Câu tiếp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {quizStatus === "wrong" && (
                <div className="p-4 rounded-2xl bg-rose-100 border border-rose-300 text-rose-800 text-sm font-bold text-center">
                  Chưa chính xác rồi, con thử lại nhé!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
