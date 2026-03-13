import { Link } from 'react-router-dom'

import { Button } from '@/shared/ui/button'

type ExternalItemProps = {
	label: string
	href: string
	title: string
	icon?: React.ComponentType<{ className?: string }>
}

type RouteItemProps = {
	label: string
	to: string
	title: string
}

export const NavExternalItem = ({ label, href, title, icon: Icon }: ExternalItemProps) => {
	return (
		<Button asChild variant="ghost">
			<a href={href} target="_blank" rel="noopener noreferrer" title={title} className="flex items-center gap-1">
				{Icon ? <Icon className="h-4 w-4" /> : null}
				{label}
			</a>
		</Button>
	)
}

export const NavRouteItem = ({ label, to, title }: RouteItemProps) => {
	return (
		<Button asChild variant="ghost">
			<Link to={to} title={title} className="flex items-center">
				{label}
			</Link>
		</Button>
	)
}
