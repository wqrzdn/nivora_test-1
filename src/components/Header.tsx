import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogIn, LogOut, Home, Users, MessageSquare, Heart, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  isScrolled: boolean;
  isOwner?: boolean;
}

const Header = ({ isScrolled, isOwner = false }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    closeMenu();
  };

  return (
    <header 
      className={`sticky top-0 w-full z-50 transition-all duration-200 ${
        isScrolled 
          ? 'bg-white shadow-md py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">Nivora</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              // Authenticated navigation
              isOwner || user?.userType === 'owner' ? (
                // Owner navigation
                <>
                  <NavLink 
                    to="/owner" 
                    className={({ isActive }) => 
                      `text-sm font-medium hover:text-primary-600 ${
                        isActive ? 'text-primary-600' : 'text-gray-700'
                      }`
                    }
                  >
                    Dashboard
                  </NavLink>
                  <NavLink 
                    to="/owner/properties" 
                    className={({ isActive }) => 
                      `text-sm font-medium hover:text-primary-600 ${
                        isActive ? 'text-primary-600' : 'text-gray-700'
                      }`
                    }
                  >
                    My Properties
                  </NavLink>
                  <NavLink 
                    to="/owner/services" 
                    className={({ isActive }) => 
                      `text-sm font-medium hover:text-primary-600 ${
                        isActive ? 'text-primary-600' : 'text-gray-700'
                      }`
                    }
                  >
                    Services
                  </NavLink>
                  <NavLink 
                    to="/owner/applications" 
                    className={({ isActive }) => 
                      `text-sm font-medium hover:text-primary-600 ${
                        isActive ? 'text-primary-600' : 'text-gray-700'
                      }`
                    }
                  >
                    Applications
                  </NavLink>
                  <NavLink 
                    to="/owner/messages" 
                    className={({ isActive }) => 
                      `text-sm font-medium hover:text-primary-600 ${
                        isActive ? 'text-primary-600' : 'text-gray-700'
                      }`
                    }
                  >
                    Messages
                  </NavLink>
                  <NavLink 
                    to="/owner/profile" 
                    className={({ isActive }) => 
                      `text-sm font-medium hover:text-primary-600 ${
                        isActive ? 'text-primary-600' : 'text-gray-700'
                      }`
                    }
                  >
                    Profile
                  </NavLink>
                </>
              ) : (
                // Tenant navigation
                <>
                  <NavLink 
                    to="/properties" 
                    className={({ isActive }) => 
                      `text-sm font-medium hover:text-primary-600 ${
                        isActive ? 'text-primary-600' : 'text-gray-700'
                      }`
                    }
                  >
                    Properties
                  </NavLink>
                  <NavLink 
                    to="/services" 
                    className={({ isActive }) => 
                      `text-sm font-medium hover:text-primary-600 ${
                        isActive ? 'text-primary-600' : 'text-gray-700'
                      }`
                    }
                  >
                    Services
                  </NavLink>
                  <NavLink 
                    to="/roommates" 
                    className={({ isActive }) => 
                      `text-sm font-medium hover:text-primary-600 ${
                        isActive ? 'text-primary-600' : 'text-gray-700'
                      }`
                    }
                  >
                    Roommates
                  </NavLink>
                  <NavLink 
                    to="/favorites" 
                    className={({ isActive }) => 
                      `text-sm font-medium hover:text-primary-600 ${
                        isActive ? 'text-primary-600' : 'text-gray-700'
                      }`
                    }
                  >
                    Favorites
                  </NavLink>
                  <NavLink 
                    to="/messages" 
                    className={({ isActive }) => 
                      `text-sm font-medium hover:text-primary-600 ${
                        isActive ? 'text-primary-600' : 'text-gray-700'
                      }`
                    }
                  >
                    Messages
                  </NavLink>
                  <NavLink 
                    to="/tenant/profile" 
                    className={({ isActive }) => 
                      `text-sm font-medium hover:text-primary-600 ${
                        isActive ? 'text-primary-600' : 'text-gray-700'
                      }`
                    }
                  >
                    Profile
                  </NavLink>
                </>
              )
            ) : (
              // Unauthenticated navigation
              <>
                <NavLink 
                  to="/properties" 
                  className={({ isActive }) => 
                    `text-sm font-medium hover:text-primary-600 ${
                      isActive ? 'text-primary-600' : 'text-gray-700'
                    }`
                  }
                >
                  Properties
                </NavLink>
                <NavLink 
                  to="/services" 
                  className={({ isActive }) => 
                    `text-sm font-medium hover:text-primary-600 ${
                      isActive ? 'text-primary-600' : 'text-gray-700'
                    }`
                  }
                >
                  Services
                </NavLink>
                <NavLink 
                  to="/roommates" 
                  className={({ isActive }) => 
                    `text-sm font-medium hover:text-primary-600 ${
                      isActive ? 'text-primary-600' : 'text-gray-700'
                    }`
                  }
                >
                  Roommates
                </NavLink>
              </>
            )}
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  <span>Hi, {user?.firstName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <LogOut className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="flex items-center text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <LogIn className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium">Login</span>
                </Link>
                <Link 
                  to="/register" 
                  className="btn btn-primary"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              {isAuthenticated ? (
                user?.userType === 'service-provider' ? (
                  // Service Provider navigation
                  <>
                    <NavLink 
                      to="/service-provider" 
                      className={({ isActive }) => 
                        `p-2 hover:bg-primary-50 rounded ${isActive ? 'text-primary-600 font-medium bg-primary-50' : ''}`
                      }
                      onClick={closeMenu}
                    >
                      <div className="flex items-center">
                        <Home className="w-5 h-5 mr-2" />
                        Dashboard
                      </div>
                    </NavLink>
                    <NavLink 
                      to="/service-provider/messages" 
                      className={({ isActive }) => 
                        `p-2 hover:bg-primary-50 rounded ${isActive ? 'text-primary-600 font-medium bg-primary-50' : ''}`
                      }
                      onClick={closeMenu}
                    >
                      <div className="flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2" />
                        <span>Messages</span>
                      </div>
                    </NavLink>
                    <NavLink 
                      to="/service-provider/profile" 
                      className={({ isActive }) => 
                        `p-2 hover:bg-primary-50 rounded ${isActive ? 'text-primary-600 font-medium bg-primary-50' : ''}`
                      }
                      onClick={closeMenu}
                    >
                      <div className="flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        <span>Profile</span>
                      </div>
                    </NavLink>
                  </>
                ) : isOwner || user?.userType === 'owner' ? (
                  // Owner navigation
                  <>
                    <NavLink 
                      to="/owner" 
                      className={({ isActive }) => 
                        `p-2 hover:bg-primary-50 rounded ${isActive ? 'text-primary-600 font-medium bg-primary-50' : ''}`
                      }
                      onClick={closeMenu}
                    >
                      <div className="flex items-center">
                        <Home className="w-5 h-5 mr-2" />
                        Dashboard
                      </div>
                    </NavLink>
                    <NavLink 
                      to="/owner/properties" 
                      className={({ isActive }) => 
                        `p-2 hover:bg-primary-50 rounded ${isActive ? 'text-primary-600 font-medium bg-primary-50' : ''}`
                      }
                      onClick={closeMenu}
                    >
                      <div className="flex items-center">
                        <Home className="w-5 h-5 mr-2" />
                        My Properties
                      </div>
                    </NavLink>
                    <NavLink 
                      to="/owner/services" 
                      className={({ isActive }) => 
                        `p-2 hover:bg-primary-50 rounded ${isActive ? 'text-primary-600 font-medium bg-primary-50' : ''}`
                      }
                      onClick={closeMenu}
                    >
                      <div className="flex items-center">
                        <Wrench className="w-5 h-5 mr-2" />
                        Services
                      </div>
                    </NavLink>
                    <NavLink 
                      to="/owner/applications" 
                      className={({ isActive }) => 
                        `p-2 hover:bg-primary-50 rounded ${isActive ? 'text-primary-600 font-medium bg-primary-50' : ''}`
                      }
                      onClick={closeMenu}
                    >
                      <div className="flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Applications
                      </div>
                    </NavLink>
                    <NavLink 
                      to="/owner/messages" 
                      className={({ isActive }) => 
                        `p-2 hover:bg-primary-50 rounded ${isActive ? 'text-primary-600 font-medium bg-primary-50' : ''}`
                      }
                      onClick={closeMenu}
                    >
                      <div className="flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2" />
                        <span>Messages</span>
                      </div>
                    </NavLink>
                    <NavLink 
                      to="/owner/profile" 
                      className={({ isActive }) => 
                        `p-2 hover:bg-primary-50 rounded ${isActive ? 'text-primary-600 font-medium bg-primary-50' : ''}`
                      }
                      onClick={closeMenu}
                    >
                      <div className="flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        <span>Profile</span>
                      </div>
                    </NavLink>
                  </>
                ) : (
                  // Tenant navigation
                  <>
                    <NavLink 
                      to="/properties" 
                      className={({ isActive }) => 
                        `p-2 hover:bg-primary-50 rounded ${isActive ? 'text-primary-600 font-medium bg-primary-50' : ''}`
                      }
                      onClick={closeMenu}
                    >
                      <div className="flex items-center">
                        <Home className="w-5 h-5 mr-2" />
                        Properties
                      </div>
                    </NavLink>
                    <NavLink 
                      to="/services" 
                      className={({ isActive }) => 
                        `p-2 hover:bg-primary-50 rounded ${isActive ? 'text-primary-600 font-medium bg-primary-50' : ''}`
                      }
                      onClick={closeMenu}
                    >
                      <div className="flex items-center">
                        <Wrench className="w-5 h-5 mr-2" />
                        Services
                      </div>
                    </NavLink>
                    <NavLink 
                      to="/roommates" 
                      className={({ isActive }) => 
                        `p-2 hover:bg-primary-50 rounded ${isActive ? 'text-primary-600 font-medium bg-primary-50' : ''}`
                      }
                      onClick={closeMenu}
                    >
                      <div className="flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Roommates
                      </div>
                    </NavLink>
                    <NavLink 
                      to="/favorites" 
                      className={({ isActive }) => 
                        `p-2 hover:bg-primary-50 rounded ${isActive ? 'text-primary-600 font-medium bg-primary-50' : ''}`
                      }
                      onClick={closeMenu}
                    >
                      <div className="flex items-center">
                        <Heart className="w-5 h-5 mr-2" />
                        Favorites
                      </div>
                    </NavLink>
                    <NavLink 
                      to="/messages" 
                      className={({ isActive }) => 
                        `p-2 hover:bg-primary-50 rounded ${isActive ? 'text-primary-600 font-medium bg-primary-50' : ''}`
                      }
                      onClick={closeMenu}
                    >
                      <div className="flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2" />
                        <span>Messages</span>
                      </div>
                    </NavLink>
                    <NavLink 
                      to="/tenant/profile" 
                      className={({ isActive }) => 
                        `p-2 hover:bg-primary-50 rounded ${isActive ? 'text-primary-600 font-medium bg-primary-50' : ''}`
                      }
                      onClick={closeMenu}
                    >
                      <div className="flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        <span>Profile</span>
                      </div>
                    </NavLink>
                  </>
                )
              ) : (
                // Unauthenticated navigation
                <>
                  <NavLink 
                    to="/properties" 
                    className={({ isActive }) => 
                      `p-2 hover:bg-primary-50 rounded ${isActive ? 'text-primary-600 font-medium bg-primary-50' : ''}`
                    }
                    onClick={closeMenu}
                  >
                    <div className="flex items-center">
                      <Home className="w-5 h-5 mr-2" />
                      Properties
                    </div>
                  </NavLink>
                  <NavLink 
                    to="/services" 
                    className={({ isActive }) => 
                      `p-2 hover:bg-primary-50 rounded ${isActive ? 'text-primary-600 font-medium bg-primary-50' : ''}`
                    }
                    onClick={closeMenu}
                  >
                    <div className="flex items-center">
                      <Wrench className="w-5 h-5 mr-2" />
                      Services
                    </div>
                  </NavLink>
                  <NavLink 
                    to="/roommates" 
                    className={({ isActive }) => 
                      `p-2 hover:bg-primary-50 rounded ${isActive ? 'text-primary-600 font-medium bg-primary-50' : ''}`
                    }
                    onClick={closeMenu}
                  >
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Roommates
                    </div>
                  </NavLink>
                </>
              )}
              
              {/* Mobile Auth */}
              <div className="pt-4 mt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="flex flex-col space-y-3">
                    <div className="p-2 text-gray-700">
                      <span>Signed in as </span>
                      <span className="font-medium">{user?.firstName} {user?.lastName}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link 
                      to="/login" 
                      className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded"
                      onClick={closeMenu}
                    >
                      <LogIn className="w-5 h-5 mr-2" />
                      <span>Login</span>
                    </Link>
                    <Link 
                      to="/register" 
                      className="flex items-center p-2 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded"
                      onClick={closeMenu}
                    >
                      <User className="w-5 h-5 mr-2" />
                      <span>Register</span>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 