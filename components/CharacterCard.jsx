"use client";

import Image from "next/image";
import Link from "next/link";
import { LockKeyhole, MessageCircle, Sparkles } from "lucide-react";

export default function CharacterCard({ character, locked = false }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[1.5rem] border border-black/[0.04] bg-white p-2 transition-all duration-300 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-1">

      {/* --- COMPACT IMAGE CONTAINER --- */}
      <div className="relative aspect-square overflow-hidden rounded-[1.1rem] bg-[#f3f4f6]">
        <Image
          src={character.avatarUrl}
          alt={character.name}
          fill
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${locked ? "saturate-50 blur-[1px]" : ""
            }`}
        />

        {/* Subtle Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-40" />

        {/* Small Tag */}
        <div className="absolute left-2.5 top-2.5">
          <span className="flex items-center gap-1 rounded-full border border-white/40 bg-white/70 px-2 py-0.5 text-[9px] font-bold uppercase tracking-tight text-slate-700 backdrop-blur-md">
            {character.tag}
          </span>
        </div>

        {/* Small Lock Overlay */}
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 backdrop-blur-[2px]">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-lg text-slate-900">
              <LockKeyhole className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>

      {/* --- COMPACT CONTENT --- */}
      <div className="flex flex-1 flex-col p-3">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight text-slate-900">
            {character.name}
          </h3>
          {locked ? (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">PRO</span>
          ) : (
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
          )}
        </div>

        <p className="mb-4 line-clamp-2 text-[13px] leading-snug text-slate-500">
          {character.description}
        </p>

        {/* --- TIGHT ACTION BUTTON --- */}
        <Link
          href={locked ? "/pricing" : `/chat/${character.id}`}
          className={`flex w-full items-center justify-center text-white gap-2 rounded-xl py-2.5 text-[13px] font-bold transition-all ${locked
              ? "bg-slate-50 text-slate-500 hover:bg-slate-100 border"
              : "bg-slate-900  hover:bg-black shadow-md shadow-slate-200"
            }`}
        >
          <MessageCircle className="h-3.5 w-3.5 text-white" />
          <p className="text-white">{locked ? "Unlock" : "Chat"}</p>
        </Link>
      </div>
    </article>
  );
}