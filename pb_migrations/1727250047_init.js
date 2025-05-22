/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const settings = app.settings()
    settings.meta.appName = 'PocketBase App'
    settings.meta.senderAddress = 'support-PB@tberra.com'
    settings.meta.senderName = 'Support PB'

    const smtp = settings.smtp
    smtp.enabled = true
    smtp.host = 'mailhog'
    smtp.port = 1025

    app.save(settings)
}, (app) => {
  // add down queries...
})
