const {
	VITE_ROUTE_HOME_SIGNED_IN,
	VITE_ROUTE_HOME_SIGNED_OUT,
	VITE_ROUTE_LOGIN,
	VITE_ROUTE_NOT_FOUND,
	VITE_ROUTE_PLANNER,
	VITE_ROUTE_MORTGAGE_TOOLS,
} = import.meta.env

const FALLBACK_ROUTES = {
	signedInHome: '/',
	planner: '/planner',
	mortgageTools: '/mortgage-tools',
	signedOutHome: '/login',
	login: '/login',
	notFound: '*',
} as const

export const ROUTE_URLS = {
	signedInHome: VITE_ROUTE_HOME_SIGNED_IN ?? FALLBACK_ROUTES.signedInHome,
	planner: VITE_ROUTE_PLANNER ?? FALLBACK_ROUTES.planner,
	mortgageTools: VITE_ROUTE_MORTGAGE_TOOLS ?? FALLBACK_ROUTES.mortgageTools,
	signedOutHome: VITE_ROUTE_HOME_SIGNED_OUT ?? FALLBACK_ROUTES.signedOutHome,
	login: VITE_ROUTE_LOGIN ?? FALLBACK_ROUTES.login,
	notFound: VITE_ROUTE_NOT_FOUND ?? FALLBACK_ROUTES.notFound,
} as const

export const getHomeRoute = (isSignedIn?: boolean) => (isSignedIn ? ROUTE_URLS.signedInHome : ROUTE_URLS.signedOutHome)
