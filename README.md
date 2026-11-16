# AmplitelDemo

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.27.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Digital Twin asset-details contract

`src/app/iframe-equipment.dto.ts` validates and clones the host's order assets.
`assetDetails.headframeConfiguration` contains the selected catalogue dimensions,
without a `type` discriminator: `height`, optional `frameLength` or `diameter`,
`pipeCount`, and optional `armConfiguration`. A single mount needs only `height`;
frames with a length or diameter also require a pipe count. Dimensions are positive
finite numbers and pipe counts are nonnegative integers, including zero.

Arm values are preserved verbatim from catalogue metadata, for example `Single`,
`Double (0.5m separation)` or `Double (1m separation)`; there is no fixed arm-option
list. Older saved configurations containing `type` are accepted based on their
actual dimensions; cloning omits that legacy field without mutating the input.
Non-headframe assets may omit configuration, and `assetDetails` may remain null.
`assetTypeKey` and `ownerCompany` accept null, matching the Digital Twin contract.
Legacy flat headframe fields remain supported.

Contract regression tests are in `src/app/iframe-equipment.dto.spec.ts`. Run the
application build with `npm run build` and test typechecking with
`node node_modules/typescript/bin/tsc --project tsconfig.spec.json --noEmit`.
These checks do not establish browser or backend persistence behavior.

Verified on 2026-10-23: 26 Jasmine contract tests pass in Node without Angular/browser stubs; test-project typechecking passes; the production build passes with a warning for the existing home-component CSS budget.
