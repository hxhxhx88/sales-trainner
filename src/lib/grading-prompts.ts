import type { ComplianceRule, Persona, TranscriptEntry } from './types'
import { gradingJsonSchema } from './types'

function formatTranscript(transcript: TranscriptEntry[]): string {
  return transcript
    .map((entry) => {
      const minutes = Math.floor(entry.timestamp / 60)
      const seconds = Math.floor(entry.timestamp % 60)
      const time = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      const speaker = entry.speaker === 'planner' ? '理财顾问' : '客户'
      return `[${time}] ${speaker}: ${entry.text}`
    })
    .join('\n')
}

function formatComplianceRules(rules: ComplianceRule[]): string {
  return rules
    .map(
      (rule) =>
        `- **${rule.name}** (${rule.severity}): ${rule.description}`
    )
    .join('\n')
}

export function buildGradingSystemPrompt(params: {
  persona: Persona
  durationSeconds: number
  outcome: string
  complianceRules: ComplianceRule[]
}): string {
  const { persona, durationSeconds, outcome, complianceRules } = params

  return `你是一位资深的香港保险销售培训师和合规官。
你正在审查一段角色扮演训练中，新手理财顾问与模拟客户之间的对话录音文字稿。

你的任务：
1. 分析对话文字稿中是否存在合规违规行为（参见下方合规规则）
2. 根据评分维度对理财顾问的表现进行评分

## 背景信息
- 客户角色：${persona.name.zh}（${persona.name.en}）— ${persona.description.zh}
- 难度级别：${persona.difficulty}
- 对话时长：${durationSeconds} 秒
- 对话结果：${outcome === 'win' ? '成功（客户决定购买）' : outcome === 'lose' || outcome === 'timeout' ? '失败（时间到期，客户未被说服）' : '手动结束'}

## 合规规则
请检查理财顾问是否违反了以下任何规则：
${formatComplianceRules(complianceRules)}

## 评分维度
请在以下维度上评分（每项0-100分）：

1. **建立关系** (Rapport Building, 权重15%): 评估理财顾问建立信任和亲和力的能力。包括：适当的问候、表达同理心、使用合适的语言风格、展示真诚的关心。

2. **需求发掘** (Needs Discovery, 权重20%): 评估理财顾问发掘客户真正需求的能力。包括：使用开放式问题、深入了解客户情况、倾听并回应客户关切、发现客户未表达的需求。

3. **产品知识** (Product Knowledge, 权重15%): 评估理财顾问对产品的了解程度。包括：准确解释产品特点、能够与竞品进行客观比较、用简单易懂的语言说明复杂概念。

4. **异议处理** (Objection Handling, 权重25%): 评估理财顾问处理客户质疑和反对意见的能力。包括：倾听并理解异议、给出有理有据的回应、重新定义问题的框架、坚持但不施压。

5. **合规性** (Compliance, 权重15%): 评估理财顾问是否遵守了合规要求。包括：没有违规行为、适当的风险披露、不做虚假承诺。

6. **成交技巧** (Closing Technique, 权重10%): 评估理财顾问的成交方法。包括：提出合适的下一步建议、自然地推进流程、不使用高压手段。

## 评分标准
- 严格但公正地评分
- 任何存在合规违规的对话，总体评分不能高于B
- 评分时引用对话中的具体片段作为依据
- 给出具体、可操作的改进建议

## 输出要求
按照指定的JSON格式返回结果，包括：
- complianceFlags：发现的所有违规行为，附带对话中的原文引用
- rubrics：每个维度的评分和具体反馈
- strengths：做得好的方面（2-4条）
- improvements：需要改进的方面（2-4条）
- summary：整体评价总结`
}

export function buildGradingUserPrompt(transcript: TranscriptEntry[]): string {
  return `## 对话文字稿

${formatTranscript(transcript)}

请根据系统提示中的要求，分析以上对话并返回评分结果。`
}

export { gradingJsonSchema }
