# ChitChat motion

Built-in Animated API; no added dependencies. Transform and opacity animations use the native driver.

- Press feedback: scale 0.975 over 100 ms; controlled spring back on release. Disabled buttons do not scale.
- Navigation: 220 ms ease-out fade between routes, preserving tab history and state.
- New outgoing messages: 220 ms opacity and 8-point upward entrance. Existing messages stay still when revisiting a chat.
- Reduce Motion: one shared OS preference listener, conservative default until preference resolves, instant navigation, no press scaling or message entrance. In-progress animations stop when the preference changes; cleanup runs on unmount.

Validation: TypeScript and targeted ESLint passed; app flow test and Reduce Motion interaction/cleanup test passed. Simulator tab switching and opening conversations exercised. Frame-rate performance, Android animation behavior and OS Reduce Motion toggling were not profiled or visually verified.
