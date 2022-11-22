import { children, Component, JSX, mergeProps, splitProps } from "solid-js";
import { classNames } from "../util";
import Spinner from "./svg/spinner";

type Props = JSX.IntrinsicElements["button"] & {
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "blank" | "red" | "green";
};

const Button: Component<Props> = (_props) => {
  const [, delegated] = splitProps(_props, ["isLoading", "variant", "class"]);
  const props = mergeProps({ isLoading: false, variant: "primary" }, _props);
  const c = children(() => props.children);

  let variantStyle = "";
  let variantText = "";

  switch (props.variant) {
    case "primary":
      variantText = "text-white";
      variantStyle = classNames(
        "bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 font-semibold",
        variantText
      );
      break;

    case "red":
      variantText = "text-white";
      variantStyle = classNames(
        "bg-red-600 hover:bg-red-500 disabled:bg-red-400 font-semibold",
        variantText
      );
      break;

    case "green":
      variantText = "text-white";
      variantStyle = classNames(
        "bg-green-600 hover:bg-green-500 disabled:bg-green-400 font-semibold",
        variantText
      );
      break;

    case "secondary":
      variantText = "text-blue-900 disabled:text-gray-500";
      variantStyle = classNames(
        "bg-blue-200 hover:bg-blue-300 disabled:bg-gray-200",
        variantText
      );
      break;

    case "outline":
      variantText = "text-gray-700 disabled:text-gray-400";
      variantStyle = classNames(
        "border border-gray-300 bg-white hover:bg-gray-100 disabled:border-gray-100 text-white font-semibold",
        variantText
      );
      break;

    case "blank":
      variantText = "text-gray-700 disabled:text-gray-400";
      variantStyle = classNames(
        "border border-none shadow-none bg-transparent hover:bg-gray-50 disabled:border-gray-100 text-white font-semibold",
        variantText
      );
      break;
  }

  return (
    <button
      class={classNames(
        "relative w-full rounded-lg py-2 px-4 font-semibold shadow-sm transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 disabled:cursor-not-allowed",
        variantStyle,
        props.class
      )}
      {...delegated}
    >
      {props.isLoading && (
        <Spinner
          class={classNames("absolute inset-0 m-auto h-5 w-5", variantText)}
        />
      )}
      <span
        aria-hidden={props.isLoading}
        class={classNames(props.isLoading && "invisible")}
      >
        {c()}
      </span>
    </button>
  );
};

export default Button;
