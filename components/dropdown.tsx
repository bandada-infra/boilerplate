export type DropdownOption = {
  id: string
  name: string
}

export type DropdownProps = {
  title: string
  options: DropdownOption[]
  onChange: (value: string) => void
}

export default function Dropdown({ title, options, onChange }: DropdownProps) {
  return (
    <div>
      <div className="text-2xl font-semibold text-slate-700 mb-2">{title}</div>
      <div className="flex justify-end items-center rounded-md cursor-pointer bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-slate-100">
        <select
          id="countries"
          className="flex bg-transparent justify-center items-center z-10 cursor-pointer w-full space-x-3 text-lg font-medium rounded-md px-5 py-3 appearance-none focus:outline-none"
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <div className="signupselect absolute mr-3"></div>
      </div>
    </div>
  )
}
