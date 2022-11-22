import { Component, JSX, mergeProps, splitProps } from "solid-js";

import { classNames } from "../util";

type Props = JSX.IntrinsicElements["input"] & {
  symbolPrefix?: string;
  symbolSuffix?: string;
  variant?: "dark-bg" | "light-bg";
};

const TextInput: Component<Props> = (_props) => {
  const [, delegated] = splitProps(_props, [
    "symbolPrefix",
    "symbolSuffix",
    "variant",
  ]);
  const props = mergeProps({ variant: "dark-bg" }, _props);

  const rawInput = (
    <input
      class={classNames(
        "block w-full appearance-none p-2 rounded-md border border-transparent text-gray-900 placeholder-gray-400 shadow transition-colors duration-75 hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm",
        props.symbolPrefix && "pl-8",
        props.symbolSuffix && "pr-8",
        props.variant === "light-bg" && "border-gray-300",
        props.class
      )}
      ref={props.ref}
      {...delegated}
    />
  );

  if (!props.symbolPrefix && !props.symbolSuffix) return rawInput;
  return (
    <div class="relative">
      {props.symbolPrefix && (
        <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 font-medium text-gray-600">
          {props.symbolPrefix}
        </span>
      )}
      {rawInput}
      {props.symbolSuffix && (
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 font-medium text-gray-600">
          {props.symbolSuffix}
        </span>
      )}
    </div>
  );
};

export default TextInput;
