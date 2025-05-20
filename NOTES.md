- https://pocketpages.dev/docs/static-content
- https://pocketbase.io/docs/js-migrations/
- https://daisyui.com/components/navbar/
- AI Art https://www.craiyon.com/
- http://tailwindcss.com/docs/
- https://pocketbase.io/jsvm/interfaces/ handy for migrations and other PB JSVM types

For OAuth, OTP, anonymous, MFA pull these in: https://github.com/benallfree/pocketpages/tree/main/packages/plugins/auth

## Notes

### GlobalAPI vs ContextAPI

pocketpages-plugin-auth internally uses api.pb() and globalApi.pb(). I found that is because in the onExtendContextApi, the api object is the context API merged with the globalApi

The pocketpages-plugin-auth library maintains its own pb_auth cookie. This is where the token created by pocketbase is stored. So calling signInWithPassword does this:

```javascript
pb()
.collection(options?.collection ?? 'users')
.authWithPassword(email, password) as AuthData

api.signIn(authData) // <---
```

where pb() is part of the global API and has no context because pocketpages-plugin-auth depends on pocketpages-plugin-js-sdk!

This matters later because on every request the cookie is checked and `request.auth` is set. Which is ultimately used by you when you want a PB client. IE: `const client = pb({ request })`

If you perform a password change, this will invalidate your login session over at PB. So when pocketpages-plugin-auth tries to check the valid token from our local cookie it fails and you are unauthenticated (request.auth is not set).

## Errors to research later

```
panic: runtime error: invalid memory address or nil pointer dereference
[signal SIGSEGV: segmentation violation code=0x1 addr=0x98 pc=0xb96145]

goroutine 50 [running]:
github.com/pocketbase/pocketbase/core.(*MigrationsRunner).initMigrationsTable(0xc000499780)
        /home/runner/work/pocketbase/pocketbase/core/migrations_runner.go:256 +0x85
github.com/pocketbase/pocketbase/core.(*MigrationsRunner).Up(0xc000499780)
        /home/runner/work/pocketbase/pocketbase/core/migrations_runner.go:123 +0x1c
github.com/pocketbase/pocketbase/core.(*BaseApp).RunAllMigrations(0xc000321188)
        /home/runner/work/pocketbase/pocketbase/core/base.go:798 +0x1bc
github.com/pocketbase/pocketbase/apis.Serve({0x18882a8, 0xc0003190e0}, {0x1, {0x11cad35, 0xe}, {0x0, 0x0}, {0xc000cc5330, 0x0, 0x1}, ...})
        /home/runner/work/pocketbase/pocketbase/apis/serve.go:65 +0xa9
github.com/pocketbase/pocketbase/cmd.NewServeCommand.func1(0xc00097ae00?, {0xc000cc5330?, 0x4?, 0x11bed26?})
        /home/runner/work/pocketbase/pocketbase/cmd/serve.go:39 +0x1bb
github.com/spf13/cobra.(*Command).execute(0xc000636f08, {0xc000cc5310, 0x1, 0x1})
        /home/runner/go/pkg/mod/github.com/spf13/cobra@v1.9.1/command.go:1015 +0xaaa
github.com/spf13/cobra.(*Command).ExecuteC(0xc000270608)
        /home/runner/go/pkg/mod/github.com/spf13/cobra@v1.9.1/command.go:1148 +0x46f
github.com/spf13/cobra.(*Command).Execute(...)
        /home/runner/go/pkg/mod/github.com/spf13/cobra@v1.9.1/command.go:1071
github.com/pocketbase/pocketbase.(*PocketBase).Execute.func2()
        /home/runner/work/pocketbase/pocketbase/pocketbase.go:199 +0x25
created by github.com/pocketbase/pocketbase.(*PocketBase).Execute in goroutine 1
        /home/runner/work/pocketbase/pocketbase/pocketbase.go:197 +0xe9
ERROR: "dev:pocketbase" exited with 2.
```