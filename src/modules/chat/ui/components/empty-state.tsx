const EmptyState = () => {
  return (
    <div className="flex h-full items-center justify-center px-4 py-10 sm:px-6 lg:px-8 bg-background transition-colors">
      <div className="text-center flex items-center flex-col">
        <h3 className="mt-2 text-2xl font-semibold text-foreground transition-colors">
          Select a chat or start a new conversation
        </h3>
      </div>
    </div>
  );
};

export default EmptyState;