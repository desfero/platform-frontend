`patches` folder contains fixes created by
[`patch-package`](https://www.npmjs.com/package/patch-package) library.

Patching a package should be avoided and used as a last resort with approval from the whole team.

The following library patches can be found here:

### react-native-gesture-handler

At the moment there is a typo in type definition and as the final result compiler throws an error.
When https://github.com/software-mansion/react-native-gesture-handler/pull/945 get's merged we can
safely delete the patch.

### @types/detox

There is a clash in detox and jest typings as they both export global with the same names. Given
that we use detox by importing from module we can for now manually remove global types until
https://github.com/solkaz/ts-detox-example/issues/2 get's fixed.

### @expo/react-native-action-sheet

We need to patch typings given there is not way to force no hoist in transitive dependency, and we
end up with invalid typings for `hoist-non-react-statics`.
