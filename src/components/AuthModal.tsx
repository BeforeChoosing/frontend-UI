import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Mail,
  LockKeyhole,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

/* =========================
   登录页背景卡
========================= */

const backgroundCards = [
  {
    id: 'bg-card-left',
    category: '写下经历 · STAGE 01',
    categoryBg: 'bg-emerald-100 text-emerald-900',
    title: '找到关键行动',
    subtitle: '从真实经历里看见你做过什么',
    accentColor:
      'from-emerald-500/20 via-teal-500/10 to-transparent',
    borderColor: 'border-emerald-200/60',
    dotColor: 'bg-emerald-500',
    style: {
      left: '-8%',
      top: '14%',
      transform: 'rotate(-14deg)',
    },
  },
  {
    id: 'bg-card-top',
    category: '看看方向 · STAGE 02',
    categoryBg: 'bg-indigo-100 text-indigo-900',
    title: '选一个值得尝试的方向',
    subtitle: '根据能力卡给出有出处的建议',
    accentColor:
      'from-indigo-500/20 via-purple-500/10 to-transparent',
    borderColor: 'border-indigo-200/60',
    dotColor: 'bg-indigo-500',
    style: {
      left: '30%',
      top: '-6%',
      transform: 'rotate(5deg)',
    },
  },
  {
    id: 'bg-card-right',
    category: '动手试试 · STAGE 03',
    categoryBg: 'bg-amber-100 text-amber-950',
    title: '完成一个小任务',
    subtitle: '用练习材料做出一份小交付',
    accentColor:
      'from-amber-500/20 via-orange-500/10 to-transparent',
    borderColor: 'border-amber-200/60',
    dotColor: 'bg-amber-500',
    style: {
      right: '-6%',
      top: '18%',
      transform: 'rotate(12deg)',
    },
  },
  {
    id: 'bg-card-bottom',
    category: '回看成长 · STAGE 04',
    categoryBg: 'bg-rose-100 text-rose-900',
    title: '保存每次收获',
    subtitle: '把任务表现和下一步建议放在一起',
    accentColor:
      'from-rose-500/20 via-pink-500/10 to-transparent',
    borderColor: 'border-rose-200/60',
    dotColor: 'bg-rose-500',
    style: {
      left: '8%',
      bottom: '-8%',
      transform: 'rotate(-6deg)',
    },
  },
];

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
}

/* =========================
   登录弹窗
========================= */

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  /* 登录 */
  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(
        account || 'user@craft.beforechoice.ai'
      );
      onClose();
    }, 500);
  };

  /* 注册 */
  const handleRegister = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(
        account || 'newuser@craft.beforechoice.ai'
      );
      onClose();
    }, 500);
  };

  /* 第三方登录 */
  const handleSocialLogin = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(
        'explorer.demo@beforechoice.ai'
      );
      onClose();
    }, 400);
  };

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        p-3 sm:p-5
        overflow-hidden
      "
    >
      {/* ======================
          背景遮罩
      ====================== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="
          absolute inset-0
          bg-stone-950/45
          backdrop-blur-md
        "
      />

      {/* ======================
          背景渐变光
      ====================== */}
      <div
        className="
          absolute inset-0
          pointer-events-none
          overflow-hidden
          flex items-center justify-center
        "
      >
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="
            absolute
            -top-20 -left-16
            w-[450px] h-[450px]
            rounded-full
            bg-gradient-to-tr
            from-amber-400/35
            via-orange-300/25
            to-rose-300/25
            blur-[95px]
          "
        />

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -25, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="
            absolute
            -bottom-24 -right-16
            w-[480px] h-[480px]
            rounded-full
            bg-gradient-to-br
            from-indigo-400/30
            via-purple-300/25
            to-pink-300/20
            blur-[100px]
          "
        />
      </div>

      {/* ======================
          背景能力卡
      ====================== */}
      <div
        className="
          absolute inset-0
          pointer-events-none
          overflow-hidden
          flex items-center justify-center
          max-w-6xl mx-auto
        "
      >
        {backgroundCards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{
              opacity: 0,
              scale: 0.85,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: 0.08 + index * 0.06,
              duration: 0.4,
              ease: 'easeOut',
            }}
            style={card.style}
            className={`
              absolute
              w-64 sm:w-72
              h-88 sm:h-96
              rounded-[32px]
              bg-white/70
              backdrop-blur-2xl
              p-5
              shadow-[0_24px_54px_rgba(0,0,0,0.12),0_1px_2px_rgba(255,255,255,1)_inset]
              border
              ${card.borderColor}
              hidden md:flex
              flex-col
              justify-between
              overflow-hidden
            `}
          >
            {/* 顶部渐变 */}
            <div
              className={`
                absolute
                top-0 left-0 right-0
                h-32
                bg-gradient-to-b
                ${card.accentColor}
                pointer-events-none
              `}
            />

            <div className="relative z-10">
              <div
                className="
                  flex items-center
                  justify-between
                  gap-1
                  mb-3
                "
              >
                <span
                  className={`
                    text-[10px]
                    font-bold
                    font-mono
                    px-2.5 py-0.5
                    rounded-full
                    ${card.categoryBg}
                  `}
                >
                  {card.category}
                </span>

                <span
                  className={`
                    w-2 h-2
                    rounded-full
                    ${card.dotColor}
                    animate-pulse
                  `}
                />
              </div>

              <h4
                className="
                  font-bold
                  text-stone-900
                  text-base
                  font-serif
                "
              >
                {card.title}
              </h4>

              <p
                className="
                  text-xs
                  text-stone-600
                  mt-1
                  leading-relaxed
                "
              >
                {card.subtitle}
              </p>
            </div>

            <div
              className="
                relative z-10
                pt-3
                border-t
                border-stone-200/50
                flex
                items-center
                justify-between
                text-[11px]
                text-stone-400
              "
            >
              <span className="font-mono">
                卡片样式 · 能力卡
              </span>

              <Sparkles
                className="
                  w-3.5 h-3.5
                  text-amber-500
                "
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ======================
          登录主体
      ====================== */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.92,
          y: 15,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.94,
          y: 10,
        }}
        transition={{
          type: 'spring',
          damping: 26,
          stiffness: 340,
          mass: 0.7,
        }}
        className="
          relative z-10
          w-full
          max-w-[430px]
          bg-white/95
          backdrop-blur-3xl
          rounded-[36px]
          p-6 sm:p-8
          shadow-[0_28px_72px_-10px_rgba(0,0,0,0.22),0_1px_2px_rgba(255,255,255,1)_inset]
          border
          border-stone-200/60
          overflow-hidden
        "
      >
        {/* 顶部暖光 */}
        <div
          className="
            absolute
            top-0 left-0 right-0
            h-28
            bg-gradient-to-b
            from-amber-200/35
            via-orange-100/15
            to-transparent
            pointer-events-none
          "
        />

        {/* 关闭 */}
        <button
          onClick={onClose}
          title="关闭"
          className="
            absolute
            top-5 right-5
            w-8 h-8
            rounded-full
            bg-stone-100/90
            hover:bg-stone-900
            hover:text-white
            flex
            items-center
            justify-center
            text-stone-500
            transition-all
            cursor-pointer
            z-20
          "
        >
          <X className="w-4 h-4" />
        </button>

        {/* ======================
            Logo
        ====================== */}
        <div
          className="
            text-center
            mb-6
            relative
            z-10
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[200px]
              py-2.5
              px-4
              rounded-2xl
              bg-gradient-to-b
              from-stone-900
              via-stone-800
              to-stone-900
              text-white
              shadow-lg
              flex
              flex-col
              items-center
              justify-center
              relative
              overflow-hidden
              mb-2
            "
          >
            <div
              className="
                absolute
                -top-4
                -right-4
                w-12 h-12
                rounded-full
                bg-amber-400/20
                blur-md
              "
            />

            <div
              className="
                flex
                items-center
                gap-1.5
                mb-0.5
              "
            >
              <span
                className="
                  font-mono
                  text-[10px]
                  tracking-widest
                  uppercase
                  text-amber-300
                  font-semibold
                "
              >
                LOGO
              </span>

              <Sparkles
                className="
                  w-2.5 h-2.5
                  text-amber-300
                "
              />
            </div>

            <span
              className="
                text-base
                font-bold
                font-serif
                tracking-tight
                text-white
              "
            >
              选择之前
            </span>
          </div>

          <p
            className="
              text-xs
              text-stone-500
            "
          >
            在选择之前，看见更多可能
          </p>
        </div>

        {/* ======================
            表单
        ====================== */}
        <form
          onSubmit={handleLogin}
          className="
            space-y-3.5
            relative
            z-10
          "
        >
          {/* 手机 / 邮箱 */}
          <div className="relative group">
            <div
              className="
                absolute
                left-3.5
                top-1/2
                -translate-y-1/2
                w-6 h-6
                rounded-lg
                bg-amber-100/80
                text-amber-900
                flex
                items-center
                justify-center
                group-focus-within:bg-amber-500
                group-focus-within:text-white
              "
            >
              <Mail className="w-3.5 h-3.5" />
            </div>

            <input
              type="text"
              value={account}
              onChange={(e) =>
                setAccount(e.target.value)
              }
              placeholder="手机号 / 电子邮箱 (name@example.com)"
              className="
                w-full
                pl-12
                pr-4
                py-3
                rounded-2xl
                bg-stone-50/90
                focus:bg-white
                focus:ring-2
                focus:ring-amber-500/30
                text-xs sm:text-sm
                text-stone-900
                placeholder:text-stone-400
                border
                border-stone-200/50
                outline-none
                transition-all
              "
            />
          </div>

          {/* 密码 */}
          <div className="relative group">
            <div
              className="
                absolute
                left-3.5
                top-1/2
                -translate-y-1/2
                w-6 h-6
                rounded-lg
                bg-indigo-100/80
                text-indigo-900
                flex
                items-center
                justify-center
                group-focus-within:bg-indigo-500
                group-focus-within:text-white
              "
            >
              <LockKeyhole
                className="
                  w-3.5 h-3.5
                "
              />
            </div>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="账户密码"
              className="
                w-full
                pl-12
                pr-4
                py-3
                rounded-2xl
                bg-stone-50/90
                focus:bg-white
                focus:ring-2
                focus:ring-indigo-500/30
                text-xs sm:text-sm
                text-stone-900
                placeholder:text-stone-400
                border
                border-stone-200/50
                outline-none
                transition-all
              "
            />
          </div>

          {/* 登录 / 注册 */}
          <div
            className="
              grid
              grid-cols-2
              gap-3
              pt-1.5
            "
          >
            <motion.button
              whileHover={{
                scale: 1.02,
                y: -1,
              }}
              whileTap={{
                scale: 0.98,
              }}
              type="submit"
              disabled={loading}
              className="
                py-3
                px-4
                rounded-2xl
                bg-stone-900
                hover:bg-black
                text-white
                text-xs sm:text-sm
                font-bold
                shadow-lg
                cursor-pointer
                flex
                items-center
                justify-center
                gap-1.5
              "
            >
              {loading ? (
                <span
                  className="
                    w-4 h-4
                    border-2
                    border-white/30
                    border-t-white
                    rounded-full
                    animate-spin
                  "
                />
              ) : (
                <>
                  <span>登录</span>
                  <ArrowRight
                    className="
                      w-3.5 h-3.5
                      text-amber-300
                    "
                  />
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{
                scale: 1.02,
                y: -1,
              }}
              whileTap={{
                scale: 0.98,
              }}
              type="button"
              onClick={handleRegister}
              disabled={loading}
              className="
                py-3
                px-4
                rounded-2xl
                bg-gradient-to-r
                from-stone-100
                to-amber-50/80
                hover:bg-stone-200
                text-stone-800
                text-xs sm:text-sm
                font-bold
                border
                border-stone-200
                cursor-pointer
              "
            >
              注册
            </motion.button>
          </div>
        </form>

        {/* ======================
            分隔线
        ====================== */}
        <div
          className="
            relative
            my-5
            text-center
          "
        >
          <div
            className="
              absolute
              inset-0
              flex
              items-center
            "
          >
            <div
              className="
                w-full
                border-t
                border-stone-200/80
              "
            />
          </div>

          <span
            className="
              relative
              px-3
              bg-white
              text-xs
              text-stone-400
              font-medium
            "
          >
            或
          </span>
        </div>

        {/* ======================
            第三方账号
        ====================== */}
        <motion.button
          whileHover={{
            scale: 1.015,
            y: -1,
          }}
          whileTap={{
            scale: 0.985,
          }}
          type="button"
          onClick={handleSocialLogin}
          className="
            relative z-10
            w-full
            py-3
            px-4
            rounded-2xl
            bg-gradient-to-r
            from-amber-50
            via-orange-50/60
            to-rose-50/80
            hover:from-amber-100
            hover:to-rose-100
            text-stone-800
            text-xs sm:text-sm
            font-bold
            border
            border-amber-200/60
            transition-all
            flex
            items-center
            justify-center
            gap-2
            cursor-pointer
          "
        >
          <Sparkles
            className="
              w-4 h-4
              text-amber-600
            "
          />
          <span>
            使用其他社交媒体账号继续
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
};
export default AuthModal;



