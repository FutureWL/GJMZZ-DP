<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=false; section>
    <#if section = "header">
        <span class="hpm-brand-badge">${msg("hpmBrandBadge")}</span>
        <span class="hpm-panel-title">${msg("loginAccountTitle")}</span>
    <#elseif section = "form">
        <div id="kc-form">
          <div id="kc-form-wrapper">
            <#if realm.password>
                <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                    <#if !usernameHidden??>
                        <div class="${properties.kcFormGroupClass!}">
                            <label for="username" class="${properties.kcLabelClass!}"><#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if></label>
                            <div class="hpm-input-wrap">
                                <svg class="hpm-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 8C10.2091 8 12 6.20914 12 4C12 1.79086 10.2091 0 8 0C5.79086 0 4 1.79086 4 4C4 6.20914 5.79086 8 8 8Z" fill="currentColor" opacity="0.4"/>
                                    <path d="M0 16C0 12.134 3.58172 9 8 9C12.4183 9 16 12.134 16 16" fill="currentColor" opacity="0.4"/>
                                </svg>
                                <input tabindex="1" id="username" class="${properties.kcInputClass!}" name="username" value="${(login.username!'')}"  type="text"
                                       autofocus autocomplete="${(enableWebAuthnConditionalUI?has_content)?then('username webauthn', 'username')}"
                                       aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                                       placeholder="${msg('username')}"
                                       dir="ltr"
                                />
                            </div>
                            <#if messagesPerField.existsError('username','password')>
                                <span id="input-error" class="${properties.kcInputErrorMessageClass!}" aria-live="polite">
                                        ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
                                </span>
                            </#if>
                        </div>
                    </#if>
                    <div class="${properties.kcFormGroupClass!}">
                        <label for="password" class="${properties.kcLabelClass!}">${msg("password")}</label>
                        <div class="hpm-input-wrap">
                            <svg class="hpm-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M12 5.5V4C12 1.79086 10.2091 0 8 0C5.79086 0 4 1.79086 4 4V5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>
                                <rect x="0.5" y="5.5" width="15" height="10" rx="2" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
                                <circle cx="8" cy="10.5" r="1.5" fill="currentColor" opacity="0.4"/>
                            </svg>
                            <input tabindex="2" id="password" class="${properties.kcInputClass!}" name="password" type="password" autocomplete="current-password"
                                   aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                                   placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                            />
                        </div>
                        <#if usernameHidden?? && messagesPerField.existsError('username','password')>
                            <span id="input-error" class="${properties.kcInputErrorMessageClass!}" aria-live="polite">
                                    ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
                            </span>
                        </#if>
                    </div>
                    <div id="kc-form-buttons" class="${properties.kcFormGroupClass!}">
                        <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
                        <button tabindex="3" class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!}" name="login" id="kc-login" type="submit">
                            <span class="hpm-btn-text">${msg("doLogIn")}</span>
                            <svg class="hpm-btn-arrow" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M3 9H15M15 9L10.5 4.5M15 9L10.5 13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </form>
            </#if>
            </div>
        </div>
        <div class="hpm-footer-info">
            <span class="hpm-footer-text">${msg("hpmSupportHint")}</span>
        </div>
    </#if>
</@layout.registrationLayout>
