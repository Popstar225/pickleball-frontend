import { useState } from 'react';
import { cn } from '@/lib/utils';

const EMOJI_CATEGORIES: { label: string; emojis: string[] }[] = [
  {
    label: '😀',
    emojis: ['😀','😁','😂','🤣','😃','😄','😅','😆','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤔','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈'],
  },
  {
    label: '👍',
    emojis: ['👍','👎','👊','✊','🤛','🤜','🤞','✌️','🤟','🤘','👌','🤌','🤏','👈','👉','👆','👇','☝️','👋','🤚','🖐️','✋','🖖','🤙','💪','🦾','🙏','👐','🤲','🤝','🙌','👏','🤜','🤛','🫶','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','💕','💞','💓','💗','💖','💘','💝'],
  },
  {
    label: '🎉',
    emojis: ['🎉','🎊','🎈','🎁','🏆','🥇','🥈','🥉','🎖️','🏅','🎗️','🎯','🎮','🎲','🎭','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🎸','🎺','🎻','🪕','🎷','🔥','⭐','🌟','💫','✨','💥','🌈','☀️','🌤️','⛅','🌧️','⛈️','🌩️','❄️','🌊','🌀'],
  },
  {
    label: '🍕',
    emojis: ['🍕','🍔','🍟','🌭','🍿','🥓','🥚','🍳','🧀','🥞','🧇','🥗','🥙','🌮','🌯','🫔','🥫','🍱','🍘','🍙','🍚','🍛','🍜','🍝','🍠','🍢','🍣','🍤','🍥','🥮','🍡','🧆','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','☕','🍵','🧃','🥤','🧋','🍺','🍻','🥂','🍷','🍸','🍹','🍾'],
  },
  {
    label: '✅',
    emojis: ['✅','❌','❓','❗','💯','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🔶','🔷','🔸','🔹','▶️','◀️','⬆️','⬇️','🔔','🔕','📢','📣','💬','💭','🗯️','📌','📍','🔗','📎','✂️','🖊️','✏️','📝','📋','📁','📂','🗂️','📊','📈','📉','🔍','🔎','🔒','🔓','🔑','🗝️','🔨','⚙️','🛠️','💡','🔋','🪫'],
  },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div
      className="absolute bottom-full mb-2 left-0 z-50 w-72 bg-[#161c25] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden"
      onMouseDown={(e) => e.preventDefault()} // prevent blur on input
    >
      {/* Category tabs */}
      <div className="flex border-b border-white/[0.07] px-2 pt-2">
        {EMOJI_CATEGORIES.map((cat, i) => (
          <button
            key={i}
            onClick={() => setActiveCategory(i)}
            className={cn(
              'flex-1 text-base py-1.5 rounded-t-lg transition-all',
              activeCategory === i
                ? 'bg-[#ace600]/10 text-[#ace600]'
                : 'text-white/40 hover:text-white/70',
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="p-2 max-h-48 overflow-y-auto">
        <div className="grid grid-cols-8 gap-0.5">
          {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, i) => (
            <button
              key={i}
              onClick={() => { onSelect(emoji); onClose(); }}
              className="text-xl p-1 rounded-lg hover:bg-white/[0.08] transition-colors leading-none"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
