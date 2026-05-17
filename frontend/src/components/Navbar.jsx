import { useLogout } from '../hooks/useLogout';
import { useAuthContext } from '../hooks/useAuthContext';
import { LogOut, Clock } from 'lucide-react';

const Navbar = () => {
    const { logout } = useLogout();
    const { user } = useAuthContext();

    const handleLogout = () => {
        logout();
    };

    return (
        <nav className='w-full h-14 flex justify-between items-center bg-white border-b border-gray-200 px-6 sticky top-0 z-10'>
            <div className='flex items-center gap-2'>
                <Clock className="w-5 h-5 text-blue-600" />
                <span className='text-lg font-bold text-gray-900'>TimeMe</span>
            </div>
            <div className='flex gap-4 items-center'>
                {user && (
                    <>
                        <span className="text-sm font-medium text-gray-500">{user.name}</span>
                        <button 
                            onClick={handleLogout}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Navbar