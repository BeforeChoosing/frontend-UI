import React, { useMemo } from 'react';

interface TaskStepInputProps {
  value: string;
  inputMode: string;
  instruction: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  maxLength?: number;
}

function getEditorMeta(inputMode: string) {
  const mode = inputMode.toLowerCase();
  if (mode.includes('流程')) {
    return {
      title: '流程草案',
      helper: '按执行顺序分行填写，每行包含角色、动作和产出。',
      placeholder: '1. 角色｜动作｜产出\n2. 角色｜动作｜产出',
    };
  }
  if (mode.includes('矩阵')) {
    return {
      title: '对比矩阵',
      helper: '按“对象｜维度｜判断依据”分行填写，保持比较维度一致。',
      placeholder: '对象 A｜成本｜判断依据\n对象 B｜风险｜判断依据',
    };
  }
  if (mode.includes('排序')) {
    return {
      title: '优先级清单',
      helper: '按 1、2、3 的顺序填写，并补充每项排序依据。',
      placeholder: '1. 项目名称｜排序依据\n2. 项目名称｜排序依据',
    };
  }
  if (mode.includes('分类') || mode.includes('多选') || mode.includes('双选') || mode.includes('单选')) {
    return {
      title: '分类与选择记录',
      helper: '逐行填写选择结果和理由；每行只记录一个对象。',
      placeholder: '对象｜选择结果｜理由\n对象｜选择结果｜理由',
    };
  }
  if (mode.includes('列表')) {
    return {
      title: '要点清单',
      helper: '每行填写一个要点，并保留必要的条件或依据。',
      placeholder: '要点一｜依据\n要点二｜依据',
    };
  }
  return {
    title: '结构化作答',
    helper: '按任务要求填写事实、判断、依据和待验证项。',
    placeholder: '请按任务要求分段填写。',
  };
}

export const TaskStepInput: React.FC<TaskStepInputProps> = ({
  value,
  inputMode,
  instruction,
  onChange,
  disabled = false,
  maxLength = 1200,
}) => {
  const editor = useMemo(() => getEditorMeta(inputMode), [inputMode]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-stone-800">{editor.title}</span>
        <span className="rounded-full bg-stone-100 px-2 py-1 text-[10px] text-stone-500">{inputMode}</span>
      </div>
      <p className="text-[11px] leading-relaxed text-stone-500">{instruction}</p>
      <p className="text-[11px] leading-relaxed text-stone-400">{editor.helper}</p>
      <textarea
        maxLength={maxLength}
        rows={8}
        value={value}
        disabled={disabled}
        onChange={event => onChange(event.target.value)}
        placeholder={editor.placeholder}
        className="w-full resize-y rounded-2xl border border-stone-200 bg-white p-3 text-sm leading-relaxed outline-none transition focus:border-purple-300 focus:ring-2 focus:ring-purple-100 disabled:bg-stone-50 disabled:text-stone-400"
        aria-label={`${editor.title}。${instruction}`}
      />
      <div className="text-right text-[10px] text-stone-400">{Array.from(value).length}/{maxLength}</div>
    </div>
  );
};
