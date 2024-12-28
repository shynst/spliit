'use client'
import { Button, ButtonProps } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { XOR } from 'ts-xor'

type RouterActions = XOR<
  { push: string },
  { replace: string },
  { back: true },
  { forward: true },
  { refresh: true }
>
type Props = RouterActions & ButtonProps

export function RouterButton({ children, ...props }: Props) {
  const router = useRouter()

  return (
    <Button
      onClick={() => {
        if (props.push) router.push(props.push)
        else if (props.replace) router.replace(props.replace)
        else if (props.back) router.back()
        else if (props.forward) router.forward()
        else if (props.refresh) router.refresh()
      }}
      {...props}
    >
      {children}
    </Button>
  )
}