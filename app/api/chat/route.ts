import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "서버에 OpenAI API Key(OPENAI_API_KEY)가 설정되어 있지 않습니다." },
        { status: 500 }
      );
    }

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "유효하지 않은 요청 데이터 형식입니다. (messages가 필요합니다.)" },
        { status: 400 }
      );
    }

    // System instruction prompting OpenAI to act as a supportive math tutor.
    const systemInstruction = {
      role: "system",
      content: 
        "당신은 초·중·고등학생을 위한 아주 친절하고 자상한 수학 전문 AI 멘토 선생님 '에듀봇(EduBot)'입니다. " +
        "학생들이 어떤 수학 공식, 원리, 문제 해결 과정을 물어보든 눈높이에 맞춰 친절하고 단계적으로 상세하게 설명해 주어야 합니다.\n\n" +
        "답변 작성 지침:\n" +
        "1. 질문한 학생을 다정하게 격려하고 흥미를 유발할 수 있는 따뜻한 어조로 시작하세요.\n" +
        "2. 복잡한 수식이나 정의는 마크다운 수식 표기(LaTeX)를 활용하여 시각적으로 가독성 높게 표시하세요. (예: $x^2 + y^2 = r^2$, $\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$)\n" +
        "3. 개념 이해를 돕기 위해 일상생활의 비유나 예제를 적극적으로 활용해 주세요.\n" +
        "4. 설명의 각 단계마다 번호를 붙여 체계적으로 안내하세요.\n" +
        "5. 답변 마지막에는 공부하느라 수고하는 학생을 칭찬하고 응원하는 멘트를 포함해 주세요."
    };

    // Prepend the system instructions to the conversation history
    const apiMessages = [systemInstruction, ...messages];

    // Direct HTTP request to OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI API error response:", errorData);
      return NextResponse.json(
        { error: `OpenAI API 호출 에러: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message;

    if (!assistantMessage) {
      return NextResponse.json(
        { error: "OpenAI 응답 데이터 분석에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(assistantMessage);
  } catch (e: any) {
    console.error("Chat API route error:", e);
    return NextResponse.json(
      { error: `서버 내부 에러: ${e.message || e}` },
      { status: 500 }
    );
  }
}
