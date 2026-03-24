import Image from "next/image";
import ReactMarkdown from "react-markdown";

export default function MessageBubble({ role, content, avatarUrl }) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[88%] items-end gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {!isUser && avatarUrl ? (
          <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full border border-black/5 bg-white">
            <Image src={avatarUrl} alt="Character avatar" fill className="object-cover" />
          </div>
        ) : null}

        <div
          className={`px-4 py-3 text-sm leading-6 shadow-sm ${isUser
              ? "rounded-[1.4rem] rounded-br-md bg-slate-900 text-white"
              : "rounded-[1.4rem] rounded-bl-md border border-black/5 bg-white text-slate-700"
            }`}
        >
          {/* Wrap ReactMarkdown in a div to apply styles.
              Added 'prose-invert' for the user bubble so text stays white.
          */}
          <div className={`prose prose-sm max-w-none prose-p:leading-relaxed ${isUser ? "prose-invert" : "prose-slate"}`}>
            <ReactMarkdown>
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}