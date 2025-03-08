export const Appbar = () => {
    return (
        <div className="shadow h-14 flex justify-between items-center px-4 font-bold">
            <div className="text-lg"></div>
            <div className="flex items-center space-x-4">
                <div className="text-center">
                    Welcome to MyMoney, I will help you manage your funds.
                </div>
                <div className="rounded-full h-12 w-12 bg-slate-200 flex items-center justify-center text-xl">
                    {/* Profile Icon or Initials */}
                </div>
            </div>
        </div>
    );
};