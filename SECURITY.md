# Security policy

## Supported versions

Security review and fixes focus on the latest published release of Type Effectively. Older versions, historical cards and experimental branches are not maintained as separate supported versions. This is an independently maintained project; no guaranteed response or remediation schedule is promised.

## Report a vulnerability privately

If you discover a potential security vulnerability, use GitHub's [private vulnerability reporting page](https://github.com/Aetherayel/Type-Effectively/security/advisories/new) if private reporting is enabled. If GitHub does not offer the private reporting option, request a private contact channel from the maintainer via a public issue, **without including vulnerability details**, then wait for a private channel before sharing technical information.

Include the affected release, a concise description, minimal safe reproduction steps, impact, and the browser or environment involved. Use synthetic test data. Do not include real questionnaire results, credentials, tokens, or other personal information.

Potentially relevant issues include script injection, malicious shared-link handling, unsafe external content, unintended disclosure of questionnaire inputs, and compromised build or publishing workflows.

Do not access other users' information, disrupt the live service, or publicly disclose exploit details before the maintainer has had a reasonable opportunity to investigate. Testing must remain within applicable law and authorization. This policy does not authorize access to unrelated systems.

## Privacy and ordinary bugs

The calculator processes questionnaire results locally. Shared URLs intentionally contain the entered values; the person who shares one decides who receives those values. PNG cards expose selected identity labels and summary indicators, not the full questionnaire payload. Third-party network requests may expose ordinary network metadata.

Ordinary scoring, balance, interface, and export bugs belong in the [feedback form](https://github.com/Aetherayel/Type-Effectively/issues/new?template=build-feedback.md).
