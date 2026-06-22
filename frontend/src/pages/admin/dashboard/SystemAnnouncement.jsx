function SystemAnnouncement({ title, message }) {
    if (!title && !message) return null

    return (
        <div className="w-full max-w-sm px-4 mt-6">
            <div className="w-full bg-[#415bf3] rounded-[14px] p-4 flex flex-col mb-4">
                <h3 className="text-white text-[13px] font-extrabold font-['DM_Sans'] mb-1">
                    {title}
                </h3>
                <p className="text-blue-100 text-[10px] font-medium font-['DM_Sans'] leading-snug">
                    {message}
                </p>
            </div>
        </div>
    )
}

export default SystemAnnouncement
