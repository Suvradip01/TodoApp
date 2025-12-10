import { Button } from "./ui/button"
import { Sparkles, X } from "lucide-react"

const SummaryModal = ({ isOpen, onClose, summary, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-100 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in">
            <div className="bg-card text-card-foreground border rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-5">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex justify-between items-center text-white">
                    <h3 className="text-xl font-semibold flex items-center gap-2"><Sparkles className="h-5 w-5" /> AI Daily Summary</h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition-colors"><X className="h-5 w-5" /></button>
                </div>

                <div className="p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                            <p className="text-muted-foreground">Generating your productivity summary...</p>
                        </div>
                    ) : (
                        <div className="prose prose-indigo dark:prose-invert max-w-none">
                            <p className="whitespace-pre-wrap text-card-foreground leading-relaxed font-medium">
                                {summary?.content || "No summary available."}
                            </p>
                            <p className="text-xs text-muted-foreground mt-4 text-right">
                                Generated on {summary?.date && new Date(summary.date).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                </div>

                <div className="bg-muted/50 p-4 flex justify-end">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SummaryModal;
