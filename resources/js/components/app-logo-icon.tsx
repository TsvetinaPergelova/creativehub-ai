import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M12 2.75L13.7694 8.2306L19.25 10L13.7694 11.7694L12 17.25L10.2306 11.7694L4.75 10L10.2306 8.2306L12 2.75Z"
                fill="currentColor"
            />
            <path
                d="M18.5 15.5L19.148 17.352L21 18L19.148 18.648L18.5 20.5L17.852 18.648L16 18L17.852 17.352L18.5 15.5Z"
                fill="currentColor"
            />
        </svg>
    );
}
