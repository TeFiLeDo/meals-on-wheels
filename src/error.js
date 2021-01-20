export function handle_error(error, t) {
  let components = error.split(":");

  let error_string;
  if (components.length < 1) {
    error_string = "error.undefined";
  } else {
    error_string = components[0];
  }

  alert(`${t([error_string, "error.undefined"])}\n\n${error}`);
}

export function handle_unexpected_variant(expected, received, t) {
  if (!Array.isArray(expected) && expected === received) {
    return true;
  } else if (Array.isArray(expected) && expected.includes(received)) {
    return true;
  } else {
    handle_error(
      `error.unexpected_variant: expected variant "${expected}", but ` +
        `received variant "${received}"`,
      t
    );
    return false;
  }
}
