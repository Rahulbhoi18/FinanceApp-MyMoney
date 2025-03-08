export function InputBox({ label, placeholder, onChange }) {
    return (
      <div>
        <div className="text-sm  text-left py-2 font-semibold text-[#429ab9]">
          {label}
        </div>
        <input
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-2 py-1 font-light border rounded border-slate-200 text-[#429ab9] placeholder-[#429ab9]"
        />
      </div>
    );
  }