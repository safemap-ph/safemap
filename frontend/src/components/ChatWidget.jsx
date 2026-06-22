import { BubbleChat } from "flowise-embed-react"
import { useEffect, useState } from "react"

function ChatWidget() {
    const [autoOpen, setAutoOpen] = useState(false)
    const [chatKey, setChatKey] = useState(0)
    
    // Handle the open chat event from QuickActions
    useEffect(() => {
        const handleOpenChat = () => {
            console.log('AI Assistant clicked - opening chat window...')
            setAutoOpen(true)
            setChatKey(prev => prev + 1)
        }
        
        window.addEventListener('safemap-open-chat', handleOpenChat)
        return () => window.removeEventListener('safemap-open-chat', handleOpenChat)
    }, [])

    return (
        <BubbleChat
            key={chatKey}
            chatflowid="a465361c-a91f-46a3-9771-81e0caf1472f"
            apiHost="https://cloud.flowiseai.com"
            theme={{
                button: {
                    backgroundColor: "#1e3a5f",
                    right: 20,
                    bottom: 110,
                    size: 48,
                    dragAndDrop: false,
                    iconColor: "#ffffff",
                },
                autoWindowOpen: {
                    autoOpen: autoOpen,
                    openDelay: 0,
                    autoOpenOnMobile: true,
                },
                chatWindow: {
                    showTitle: true,
                    title: "SafeMap Assistant",
                    welcomeMessage: "Hi! I'm the SafeMap Assistant 🛡️\n\nHow can I help you today?",
                    backgroundColor: "#ffffff",
                    height: 500,
                    width: 350,
                    fontSize: 15,
                    zIndex: 9999,
                    starterPrompts: ["Report Incident", "PNP Contact", "Safety Tips"],
                    textInput: {
                        placeholder: "Ask about SafeMap…",
                    }
                }
            }}
        />
    )
}

export default ChatWidget
