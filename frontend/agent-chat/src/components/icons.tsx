import { Bot, Minimize2, User, X } from 'lucide-react'
import * as React from 'react'

export const UserIcon = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>((props, ref) => <User ref={ref} {...props} className="h-5 w-5" />)
UserIcon.displayName = 'UserIcon'

export const BotIcon = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>((props, ref) => <Bot ref={ref} {...props} className="h-5 w-5" />)
BotIcon.displayName = 'BotIcon'

export const CloseIcon = X
export const MinimizeIcon = Minimize2
