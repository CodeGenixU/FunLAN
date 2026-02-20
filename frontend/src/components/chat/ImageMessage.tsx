export const ImageMessage = ({ fileId, filename }: { fileId: string; filename: string }) => {
    return (
        <a href={`/api/download/${fileId}`} target="_blank" rel="noopener noreferrer">
            <img
                src={`/api/download/${fileId}`}
                alt={filename}
                className="max-w-full sm:max-w-xs rounded-xl max-h-64 object-cover"
            />
        </a>
    );
};
