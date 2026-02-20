export const VideoMessage = ({ fileId }: { fileId: string }) => {
    return (
        <video
            src={`/api/download/${fileId}`}
            controls
            className="max-w-full sm:max-w-xs rounded-xl max-h-64 bg-black/20"
        />
    );
};
