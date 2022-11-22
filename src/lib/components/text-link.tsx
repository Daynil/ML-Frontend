import { children, Component, JSX, splitProps } from "solid-js";
import { classNames } from "../util";

type Props = JSX.IntrinsicElements["a"];

const TextLink: Component<Props> = (props) => {
  const [, delegated] = splitProps(props, ["href", "rel", "target"]);
  const c = children(() => props.children);

  const external = props.href.match(/(^http|^mailto)/i);
  const internalImage = props.href.match(/(^\/static\/)/i);

  // Open external links and internal images in a new tab
  // If we use Gatsby's link for an internal image, it breaks
  const target = external || internalImage ? "_blank" : "_self";

  // External links should have noopener for security
  // Prevents the new page from being able to access to window.opener
  let rel = "";
  if (external) rel = "noopener";

  const link =
    external || internalImage ? (
      <a
        class={classNames(
          "rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          props.class
        )}
        href={props.href}
        rel={props.rel ? props.rel : rel}
        target={props.target ? props.target : target}
        {...delegated}
      >
        {c()}
      </a>
    ) : (
      <a href={props.href}>{c()}</a>
    );

  return (
    <span
      class={classNames(
        "border-b-2 border-blue-500 text-gray-900 transition duration-200 ease-in-out hover:border-transparent hover:text-blue-500 focus:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        props.class
      )}
    >
      {link}
    </span>
  );
};

export default TextLink;
