from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import TypedDict, Annotated
import operator
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
import os
from dotenv import load_dotenv

load_dotenv(override=True)

app = FastAPI(title="Code Chat API")
api_key = os.getenv("OPENAI_API_KEY")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 요청/응답 모델
class ChatRequest(BaseModel):
    message: str
    code_context: str

class ChatResponse(BaseModel):
    response: str

# LangGraph State 정의
class AgentState(TypedDict):
    messages: Annotated[list, operator.add]
    code_context: str
    final_response: str

# LLM 초기화 (OpenAI GPT-4)
llm = ChatOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    model="gpt-4o",
    temperature=0.7,
    # API 키는 환경변수 OPENAI_API_KEY에서 자동으로 읽습니다
)

# Agent 노드 함수들
def analyze_code(state: AgentState) -> AgentState:
    """코드 컨텍스트를 분석하는 노드"""
    code = state["code_context"]
    user_message = state["messages"][-1].content
    
    system_prompt = f"""당신은 숙련된 프로그래머입니다. 
사용자가 제공한 코드를 분석하고, 질문에 답변하거나 개선사항을 제안합니다.

현재 코드 컨텍스트:
```
{code}
```

위 코드를 참고하여 사용자의 질문에 답변해주세요.
코드 분석, 버그 수정, 최적화, 설명 등을 도와주세요."""

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_message)
    ]
    
    response = llm.invoke(messages)
    
    return {
        "messages": [AIMessage(content=response.content)],
        "final_response": response.content
    }

def create_programmer_agent():
    """프로그래머 에이전트 그래프 생성"""
    workflow = StateGraph(AgentState)
    
    # 노드 추가
    workflow.add_node("analyze", analyze_code)
    
    # 엣지 추가
    workflow.set_entry_point("analyze")
    workflow.add_edge("analyze", END)
    
    return workflow.compile()

# 에이전트 인스턴스 생성
programmer_agent = create_programmer_agent()

@app.get("/")
async def root():
    return {"message": "Code Chat API is running"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """채팅 엔드포인트"""
    try:
        # 초기 상태 설정
        initial_state = {
            "messages": [HumanMessage(content=request.message)],
            "code_context": request.code_context,
            "final_response": ""
        }
        
        # 에이전트 실행
        result = programmer_agent.invoke(initial_state)
        
        return ChatResponse(response=result["final_response"])
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
