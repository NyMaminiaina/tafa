type Props = {
    open: boolean;
    type: "success" | "error" | "confirm";
    message: string;

    onClose: () => void;

    onConfirm?: () => void;

    secondaryButton?: {
        text: string;
        onClick: () => void;
    };
};

export default function AlertModal({
    open,
    type,
    message,
    onClose,
    onConfirm,
    secondaryButton,
}: Props) {
    if (!open) return null;

    const config = {
        success: {
            title: "Succès",
            titleColor: "text-emerald-600",
            buttonColor: "bg-emerald-600 hover:bg-emerald-700",
        },
        error: {
            title: "Erreur",
            titleColor: "text-red-600",
            buttonColor: "bg-red-600 hover:bg-red-700",
        },
        confirm: {
            title: "Confirmation",
            titleColor: "text-amber-600",
            buttonColor: "bg-red-600 hover:bg-red-700",
        },
    };

    const style = config[type];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm shadow-xl">

                <h2 className={`text-xl font-bold mb-3 ${style.titleColor}`}>
                    {style.title}
                </h2>

                <p className="text-gray-600 mb-6">
                    {message}
                </p>

                {type === "confirm" ? (

                    <div className="flex gap-3">

                        <button
                            onClick={onClose}
                            className="flex-1 border rounded-xl py-2"
                        >
                            Annuler
                        </button>

                        <button
                            onClick={() => {
                                onConfirm?.();
                                onClose();
                            }}
                            className={`flex-1 text-white rounded-xl py-2 ${style.buttonColor}`}
                        >
                            Confirmer
                        </button>

                    </div>

                ) : (

                    <div className="flex gap-3">

                        <button
                            onClick={onClose}
                            className="flex-1 py-2 border border-gray-300 rounded-xl hover:bg-gray-100"
                        >
                            OK
                        </button>

                        {secondaryButton && (
                            <button
                                onClick={() => {
                                    secondaryButton.onClick();
                                    onClose();
                                }}
                                className={`flex-1 py-2 text-white rounded-xl ${style.buttonColor}`}
                            >
                                {secondaryButton.text}
                            </button>
                        )}

                    </div>

                )}

            </div>
        </div>
    );
}