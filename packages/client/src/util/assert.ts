export default function (truthy: any, msg: string): asserts truthy {
  if (!truthy) {
    debugger;
    console.error(msg);
    throw new Error(msg);
  }
}
