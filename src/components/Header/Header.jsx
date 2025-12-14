import React from 'react'

const Header = () => {
  return (
    <div>
      <header>
    {/* <!-- navbar --> */}
    <div className="border-b">
        <div className="bg-gray-100 py-1">
            <div className="container">
                <div className="flex flex-wrap">
                    <div className="md:w-1/2 w-full text-center md:text-left"><span>Super Value Deals - Save more with
                            coupons</span>
                    </div>
                    <div className="w-1/2 text-right hidden lg:block">
                        <div className="dropdown flex justify-end">
                            <a className="dropdown-toggle text-inherit flex items-center" href="#!"
                                data-bs-toggle="dropdown" id="dropdownMenuLink">
                                <span className="mr-2">
                                    <svg width="16" height="13" viewBox="0 0 16 13" fill="none"
                                        xmlns="http://www.w3.org/2000/svg" id="languageIcon">
                                        {/* <!-- Default SVG content for English --> */}
                                        <g clip-path="">
                                            <path d="M0 0.5H16V12.5H0V0.5Z" fill="#012169" />
                                            <path
                                                d="M1.875 0.5L7.975 5.025L14.05 0.5H16V2.05L10 6.525L16 10.975V12.5H14L8 8.025L2.025 12.5H0V11L5.975 6.55L0 2.1V0.5H1.875Z"
                                                fill="white" />
                                            <path
                                                d="M10.6 7.525L16 11.5V12.5L9.225 7.525H10.6ZM6 8.025L6.15 8.9L1.35 12.5H0L6 8.025ZM16 0.5V0.575L9.775 5.275L9.825 4.175L14.75 0.5H16ZM0 0.5L5.975 4.9H4.475L0 1.55V0.5Z"
                                                fill="#C8102E" />
                                            <path d="M6.025 0.5V12.5H10.025V0.5H6.025ZM0 4.5V8.5H16V4.5H0Z"
                                                fill="white" />
                                            <path d="M0 5.325V7.725H16V5.325H0ZM6.825 0.5V12.5H9.225V0.5H6.825Z"
                                                fill="#C8102E" />
                                        </g>
                                    </svg>
                                </span>
                                <span id="selectedLanguage">English</span>
                            </a>

                            <ul className="dropdown-menu">
                                <li>
                                    <a className="dropdown-item" href="#!" onclick="changeLanguage('English')">
                                        <span>
                                            <svg width="16" height="13" viewBox="0 0 16 13" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <g clip-path="">
                                                    <path d="M0 0.5H16V12.5H0V0.5Z" fill="#012169" />
                                                    <path
                                                        d="M1.875 0.5L7.975 5.025L14.05 0.5H16V2.05L10 6.525L16 10.975V12.5H14L8 8.025L2.025 12.5H0V11L5.975 6.55L0 2.1V0.5H1.875Z"
                                                        fill="white" />
                                                    <path
                                                        d="M10.6 7.525L16 11.5V12.5L9.225 7.525H10.6ZM6 8.025L6.15 8.9L1.35 12.5H0L6 8.025ZM16 0.5V0.575L9.775 5.275L9.825 4.175L14.75 0.5H16ZM0 0.5L5.975 4.9H4.475L0 1.55V0.5Z"
                                                        fill="#C8102E" />
                                                    <path d="M6.025 0.5V12.5H10.025V0.5H6.025ZM0 4.5V8.5H16V4.5H0Z"
                                                        fill="white" />
                                                    <path d="M0 5.325V7.725H16V5.325H0ZM6.825 0.5V12.5H9.225V0.5H6.825Z"
                                                        fill="#C8102E" />
                                                </g>
                                                <defs>
                                                    <clipPath>
                                                        <rect width="16" height="12" fill="white"
                                                            transform="translate(0 0.5)" />
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                        </span>
                                        English
                                    </a>
                                </li>
                                <li>
                                    <a className="dropdown-item" href="#!" onclick="changeLanguage('Deutsch')">
                                        <span>
                                            <svg width="16" height="13" viewBox="0 0 16 13" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <g clip-path="url(#clip0_5543_19751)">
                                                    <path d="M0 8.5H16V12.5H0V8.5Z" fill="#FFCE00" />
                                                    <path d="M0 0.5H16V4.5H0V0.5Z" fill="black" />
                                                    <path d="M0 4.5H16V8.5H0V4.5Z" fill="#DD0000" />
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_5543_19751">
                                                        <rect width="16" height="12" fill="white"
                                                            transform="translate(0 0.5)" />
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                        </span>
                                        Deutsch
                                    </a>
                                </li>
                                {/* <!-- Add more languages as needed --> */}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="pt-5">
            <div className="container">
                <div className="flex flex-wrap w-full items-center justify-between">
                    <div className="lg:w-1/6 md:w-1/2 w-2/5">
                        <a className="navbar-brand" href="@@webRoot/index.html">
                            <img src="@@webRoot/assets/images/logo/freshcart-logo.svg"
                                alt="TailwindCSS eCommerce HTML Template" />
                        </a>
                    </div>
                    <div className="lg:w-2/5 hidden lg:block">
                        <form action="#">
                            <div className="relative">
                                <label for="searchProducts" className="invisible hidden">Search</label>
                                <input
                                    className="border border-gray-300 text-gray-900 rounded-lg focus:shadow-[0_0_0_.25rem_rgba(10,173,10,.25)] focus:ring-green-600 focus:ring-0 focus:border-green-600 block p-2 px-3 disabled:opacity-50 disabled:pointer-events-none w-full text-base"
                                    type="search" placeholder="Search for products" id="searchProducts" />
                                <button className="absolute right-0 top-0 p-3" type="button">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-search"
                                        width="16" height="16" viewBox="0 0 24 24" stroke-width="2"
                                        stroke="currentColor" fill="none" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                                        <path d="M21 21l-6 -6" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="lg:w-1/5 hidden lg:block">
                        {/* <!-- Button trigger modal --> */}
                        <button type="button"
                            className="btn inline-flex items-center gap-x-2 bg-transparent text-gray-600 border-gray-300 disabled:opacity-50 disabled:pointer-events-none hover:text-white hover:bg-gray-700 hover:border-gray-700 active:bg-gray-700 active:border-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300"
                            data-bs-toggle="modal" data-bs-target="#locationModal">
                            <span className="flex items-center gap-1">
                                <span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-map-pin"
                                        width="16" height="16" viewBox="0 0 24 24" stroke-width="2"
                                        stroke="currentColor" fill="none" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                                        <path
                                            d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z" />
                                    </svg>
                                </span>
                                <span>Location</span>
                            </span>
                        </button>
                    </div>
                    <div className="lg:w-1/5 text-end md:w-1/2 w-3/5">
                        <div className="flex gap-7 items-center justify-end">
                            <div>
                                <a href="#!" className="relative">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-heart"
                                        width="24" height="24" viewBox="0 0 24 24" stroke-width="2"
                                        stroke="currentColor" fill="none" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path
                                            d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
                                    </svg>
                                    <span
                                        className="absolute top-0 -mt-1 left-full rounded-full h-5 w-5 -ml-2 bg-green-600 text-white text-center font-semibold text-sm">
                                        5
                                        <span className="invisible">unread messages</span>
                                    </span>
                                </a>
                            </div>
                            <div>
                                <a href="#!" className="text-gray-600" data-bs-toggle="modal" data-bs-target="#userModal">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-user"
                                        width="22" height="22" viewBox="0 0 24 24" stroke-width="2"
                                        stroke="currentColor" fill="none" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                                        <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                                    </svg>
                                </a>
                            </div>
                            <div>
                                <button type="button" className="text-gray-600 relative" data-bs-toggle="offcanvas"
                                    data-bs-target="#offcanvasRight" role="button" aria-controls="offcanvasRight">
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                        className="icon icon-tabler icon-tabler-shopping-bag" width="24" height="24"
                                        viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                                        stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path
                                            d="M6.331 8h11.339a2 2 0 0 1 1.977 2.304l-1.255 8.152a3 3 0 0 1 -2.966 2.544h-6.852a3 3 0 0 1 -2.965 -2.544l-1.255 -8.152a2 2 0 0 1 1.977 -2.304z" />
                                        <path d="M9 11v-5a3 3 0 0 1 6 0v5" />
                                    </svg>
                                    <span id="cartCount"
                                        className="absolute top-0 -mt-1 left-full rounded-full h-5 w-5 -ml-3 bg-green-600 text-white text-center font-semibold text-sm">
                                        0
                                        <span className="invisible">unread messages</span>
                                    </span>
                                </button>
                            </div>
                            <div className="lg:hidden leading-none">
                                {/* <!-- Button --> */}
                                <button className="collapsed" type="button" data-bs-toggle="offcanvas"
                                    data-bs-target="#navbar-default" aria-controls="navbar-default"
                                    aria-label="Toggle navigation">
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                        className="icon icon-tabler icon-tabler-menu-2 text-gray-800" width="24" height="24"
                                        viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none"
                                        stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M4 6l16 0" />
                                        <path d="M4 12l16 0" />
                                        <path d="M4 18l16 0" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <nav className="navbar relative navbar-expand-lg lg:flex lg:flex-wrap items-center content-between text-black navbar-default"
            aria-label="Offcanvas navbar large">
            <div className="container max-w-7xl mx-auto w-full xl:px-4 lg:px-0">
                <div className="offcanvas offcanvas-left lg:visible" tabindex="-1" id="navbar-default">
                    <div className="offcanvas-header pb-1">
                        <a href="@@webRoot/index.html"><img src="@@webRoot/assets/images/logo/freshcart-logo.svg"
                                alt="TailwindCSS eCommerce HTML Template" /></a>
                        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close">
                            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-x text-gray-700"
                                width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
                                fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M18 6l-12 12" />
                                <path d="M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="offcanvas-body lg:flex lg:items-center">
                        <div className="block lg:hidden mb-4">
                            <form action="#">
                                <div className="relative">
                                    <label for="searhNavbar" className="invisible hidden">Search</label>
                                    <input
                                        className="border border-gray-300 text-gray-900 rounded-lg focus:shadow-[0_0_0_.25rem_rgba(10,173,10,.25)] focus:ring-green-600 focus:ring-0 focus:border-green-600 block p-2 px-3 disabled:opacity-50 disabled:pointer-events-none w-full text-base"
                                        type="search" placeholder="Search for products" id="searhNavbar" />
                                    <button className="absolute right-0 top-0 p-3" type="button">
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                            className="icon icon-tabler icon-tabler-search" width="16" height="16"
                                            viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                                            stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                                            <path d="M21 21l-6 -6" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="block lg:hidden mb-4">
                            <a className="btn inline-flex items-center gap-x-2 bg-green-600 text-white border-green-600 disabled:opacity-50 disabled:pointer-events-none hover:text-white hover:bg-green-700 hover:border-green-700 active:bg-green-700 active:border-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 justify-center"
                                data-bs-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false"
                                aria-controls="collapseExample">
                                <span className="mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                        className="icon icon-tabler icon-tabler-layout-grid" width="16" height="16"
                                        viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                                        stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path
                                            d="M4 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                                        <path
                                            d="M14 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                                        <path
                                            d="M4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                                        <path
                                            d="M14 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                                    </svg>
                                </span>
                                All Departments
                            </a>
                            <div className="collapse mt-2" id="collapseExample">
                                <div className="card card-body">
                                    <ul className="list-unstyled">
                                        <li><a className="dropdown-item" href="#!">Dairy, Bread & Eggs</a></li>
                                        <li><a className="dropdown-item" href="#!">Snacks & Munchies</a></li>
                                        <li><a className="dropdown-item" href="#!">Fruits & Vegetables</a></li>
                                        <li><a className="dropdown-item" href="#!">Cold Drinks & Juices</a></li>
                                        <li><a className="dropdown-item" href="#!">Breakfast & Instant Food</a></li>
                                        <li><a className="dropdown-item" href="#!">Bakery & Biscuits</a></li>
                                        <li><a className="dropdown-item" href="#!">Chicken, Meat & Fish</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="dropdown hidden lg:block">
                            <button
                                className="mr-4 btn inline-flex items-center gap-x-2 bg-green-600 text-white border-green-600 disabled:opacity-50 disabled:pointer-events-none hover:text-white hover:bg-green-700 hover:border-green-700 active:bg-green-700 active:border-green-700 focus:outline-none focus:ring-4 focus:ring-green-300"
                                type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                <span>
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                        className="icon icon-tabler icon-tabler-layout-grid" width="16" height="16"
                                        viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                                        stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path
                                            d="M4 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                                        <path
                                            d="M14 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                                        <path
                                            d="M4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                                        <path
                                            d="M14 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                                    </svg>
                                </span>
                                All Departments
                            </button>
                            <ul className="dropdown-menu">
                                <li><a className="dropdown-item" href="#!">Dairy, Bread & Eggs</a></li>
                                <li><a className="dropdown-item" href="#!">Snacks & Munchies</a></li>
                                <li><a className="dropdown-item" href="#!">Fruits & Vegetables</a></li>
                                <li><a className="dropdown-item" href="#!">Cold Drinks & Juices</a></li>
                                <li><a className="dropdown-item" href="#!">Breakfast & Instant Food</a></li>
                                <li><a className="dropdown-item" href="#!">Bakery & Biscuits</a></li>
                                <li><a className="dropdown-item" href="#!">Chicken, Meat & Fish</a></li>
                            </ul>
                        </div>
                        <div>
                            <ul className="navbar-nav lg:flex gap-3 lg:items-center">
                                <li className="nav-item dropdown w-full lg:w-auto">
                                    <a className="nav-link " href="@@webRoot/index.html" role="button">Home</a>

                                </li>
                                <li className="nav-item dropdown w-full lg:w-auto">
                                    <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                                        aria-expanded="false">Dropdown Menu</a>
                                    <ul className="dropdown-menu">

                                        <li>
                                            <a className="dropdown-item" href="#!">
                                                Dropdown Link

                                            </a>
                                        </li>
                                        <li>
                                            <a className="dropdown-item" href="#!">
                                                Dropdown Link

                                            </a>
                                        </li>
                                        <li>
                                            <a className="dropdown-item" href="#!">
                                                Dropdown Link

                                            </a>
                                        </li>
                                        <li>
                                            <a className="dropdown-item" href="#!">
                                                Dropdown Link

                                            </a>
                                        </li>
                                    </ul>
                                </li>

                                <li className="nav-item dropdown w-full lg:w-auto dropdown-fullwidth">
                                    <a className="nav-link " href="#!">Mega
                                        menu
                                    </a>

                                </li>


                                <li className="nav-item">
                                    <a className="nav-link" href="#!">Dashboard</a>
                                </li>


                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    </div>
</header>
    </div>
  )
}

export default Header
