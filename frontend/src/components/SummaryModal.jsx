const SummaryModal = ({ isOpen, onClose, summary, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex justify-between items-center text-white">
                    <h3 className="text-xl font-semibold">✨ AI Daily Summary</h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded">✖</button>
                </div>

                <div className="p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                            <p className="text-gray-500">Generating your productivity summary...</p>
                        </div>
                    ) : (
                        <div className="prose prose-indigo max-w-none">
                            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed font-medium">
                                {summary?.content || "No summary available."}
                            </p>
                            <p className="text-xs text-gray-400 mt-4 text-right">
                                Generated on {summary?.date && new Date(summary.date).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 p-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SummaryModal;
