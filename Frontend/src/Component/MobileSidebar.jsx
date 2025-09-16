import React from 'react'
import { Trash, X } from "lucide-react"
const MobileSidebar = ({ sidebarOpen, onClose, history, handleDeleteHistory, setSelectedHistory }) => {

    return (
        <div
            className={`
          fixed top-0 right-0 h-full w-52 bg-zinc-800 text-white md:hidden
          transform transition-transform duration-300 ease-in-out z-50
          ${sidebarOpen ? "translate-x-0" : "translate-x-full"}
        `}
        >
            <X onClick={onClose} className='ml-auto relative right-3 top-2 cursor-pointer' />

            <h1 className="p-4 text-lg font-semibold ">Recent Search</h1>
            <ul className="space-y-1 text-left overflow-auto px-1">
                {
                    history && history.map((item, index) => (
                        <div key={index} className='flex items-center gap-1 justify-between hover:bg-zinc-600 px-1 rounded-sm'>
                            <li onClick={() => {
                                setSelectedHistory(item)
                                onClose()
                            }
                            } className="text-zinc-400 text-ellipsis line-clamp-1 w-full hover:cursor-pointer hover:text-zinc-300">{item}</li>
                            <Trash onClick={() => handleDeleteHistory(index)} size={15} className="text-zinc-400 hover:cursor-pointer hover:text-zinc-300" />
                        </div>
                    ))
                }
            </ul>
        </div>
    )
}

export default MobileSidebar
