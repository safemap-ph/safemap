import { useNavigate } from "react-router-dom"

function Footer() {
    const navigate = useNavigate()

    return (
        <div className="fixed bottom-[72px] left-0 w-full bg-white/95 backdrop-blur-sm border-t border-gray-200 py-2 px-4 z-1999">
            <div className="max-w-md mx-auto flex items-center justify-center gap-4 text-xs text-gray-600">
                <button
                    onClick={() => navigate("/privacy")}
                    className="hover:text-blue-700 hover:underline transition-colors">
                    Privacy Policy
                </button>
                <span className="text-gray-300">|</span>
                <button
                    onClick={() => navigate("/terms")}
                    className="hover:text-blue-700 hover:underline transition-colors">
                    Terms of Service
                </button>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">© 2026 SafeMap-PH</span>
            </div>
        </div>
    )
}

export default Footer
