"use client"

import { useEffect, useState } from "react"
import { Bot } from "lucide-react"

export default function VirAssistant() {
  const [vapi, setVapi] = useState(null)
  const [status, setStatus] = useState("Ready")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")
  const [isApiKeyValid, setIsApiKeyValid] = useState(true)

  // Initialize Vapi on client-side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("@vapi-ai/web").then((module) => {
        const Vapi = module.default

        // Get API key from environment variables - only check once
        const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY || ""

        if (!apiKey) {
          setErrorMessage("API key is missing. Please check your environment variables.")
          setStatus("Error")
          setIsApiKeyValid(false)
          return
        }

        // Initialize Vapi
        const vapiInstance = new Vapi(apiKey)
        setVapi(vapiInstance)
        setIsApiKeyValid(true)

        // Set up event listeners
        vapiInstance.on("call-start", () => {
          setIsConnecting(false)
          setIsConnected(true)
          setErrorMessage("")
          setStatus("Connected")
        })

        vapiInstance.on("call-end", () => {
          setIsConnecting(false)
          setIsConnected(false)
          setStatus("Call ended")
        })

        vapiInstance.on("speech-start", () => {
          setIsSpeaking(true)
        })

        vapiInstance.on("speech-end", () => {
          setIsSpeaking(false)
        })

        vapiInstance.on("volume-level", (level) => {
          setVolumeLevel(level)
        })

        vapiInstance.on("error", (error) => {
          console.error("Vapi error:", error)
          setIsConnecting(false)

          // Handle different types of errors
          if (error?.error?.message?.includes("card details")) {
            setErrorMessage("Payment required. Visit the Vapi dashboard to set up your payment method.")
          } else if (error?.error?.statusCode === 401 || error?.error?.statusCode === 403) {
            // API key is invalid - update state
            setErrorMessage("API key is invalid. Please check your environment variables.")
            setIsApiKeyValid(false)
          } else {
            setErrorMessage(error?.error?.message || "An error occurred")
          }

          setStatus("Error")
        })
      })
    }

    // Cleanup function
    return () => {
      if (vapi) {
        vapi.stop()
      }
    }
  }, [])

  // Start call function - no need to recheck API key
  const startCall = () => {
    if (!isApiKeyValid) {
      setErrorMessage("Cannot start call: API key is invalid or missing.")
      return
    }

    // Get assistant ID from environment variables
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || ""
    
    if (!assistantId) {
      setErrorMessage("Assistant ID is missing. Please check your environment variables.")
      setStatus("Error")
      return
    }

    setIsConnecting(true)
    setStatus("Connecting...")
    setErrorMessage("")

    vapi.start(assistantId)
  }

  // End call function
  const endCall = () => {
    if (vapi) {
      vapi.stop()
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        color: "white",
      }}
    >
      <div 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          marginBottom: "20px" 
        }}
      >
        <Bot 
          size={48} 
          color="#3ef07c" 
          strokeWidth={1.5} 
          style={{ marginRight: "16px" }} 
        />
        <h1 style={{ fontSize: "32px", fontWeight: "600" }}>Virtual Voice Assistant</h1>
      </div>
      
      <div 
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderRadius: "16px",
          padding: "24px",
          maxWidth: "500px",
          width: "100%",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(5px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          marginBottom: "24px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
          <div 
            style={{ 
              width: "12px", 
              height: "12px", 
              borderRadius: "50%", 
              backgroundColor: isConnected ? "#3ef07c" : isConnecting ? "#f0ad3e" : "#6c757d",
              marginRight: "10px" 
            }}
          ></div>
          <p style={{ fontWeight: "500" }}>Status: {status}</p>
        </div>

        {isConnected && (
          <div style={{ marginTop: "16px" }}>
            <p style={{ 
              marginBottom: "14px", 
              fontWeight: "500", 
              color: isSpeaking ? "#3ef07c" : "#f0ad3e" 
            }}>
              {isSpeaking ? "Assistant is speaking" : "Assistant is listening"}
            </p>

            {/* Enhanced volume indicator */}
            <p style={{ fontSize: "14px", marginBottom: "6px", color: "rgba(255, 255, 255, 0.7)" }}>Volume Level</p>
            <div
              style={{
                display: "flex",
                marginBottom: "10px",
                gap: "4px",
                alignItems: "flex-end",
                height: "30px"
              }}
            >
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  style={{
                    width: "20px",
                    height: `${(i + 1) * 3}px`,
                    backgroundColor: i / 10 < volumeLevel ? "#3ef07c" : "rgba(255, 255, 255, 0.15)",
                    borderRadius: "2px",
                    transition: "background-color 0.2s, height 0.1s"
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {errorMessage && (
        <div
          style={{
            backgroundColor: "rgba(240, 62, 62, 0.8)",
            padding: "18px",
            borderRadius: "12px",
            marginBottom: "24px",
            maxWidth: "500px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(240, 62, 62, 0.3)",
          }}
        >
          <p style={{ fontWeight: "500" }}>{errorMessage}</p>

          {errorMessage.includes("payment") && (
            <a
              href="https://dashboard.vapi.ai"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: "14px",
                color: "white",
                textDecoration: "underline",
                fontWeight: "500",
                padding: "6px 12px",
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderRadius: "6px",
              }}
            >
              Go to Vapi Dashboard
            </a>
          )}
        </div>
      )}

      <button
        onClick={isConnected ? endCall : startCall}
        disabled={isConnecting || !isApiKeyValid}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isConnected ? "rgba(240, 62, 62, 0.9)" : "#3ef07c",
          color: isConnected ? "white" : "#010810",
          border: "none",
          borderRadius: "12px",
          padding: "14px 28px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: isConnecting || !isApiKeyValid ? "not-allowed" : "pointer",
          opacity: isConnecting || !isApiKeyValid ? 0.7 : 1,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          transition: "all 0.2s ease",
        }}
        onMouseOver={(e) => {
          if (!isConnecting && isApiKeyValid) {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.2)";
          }
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
        }}
      >
        <Bot 
          size={20} 
          style={{ 
            marginRight: "8px",
            color: isConnected ? "white" : "#010810"
          }} 
        />
        {isConnecting ? "Connecting..." : isConnected ? "End Call" : "Call Assistant"}
      </button>
    </div>
  )
}
