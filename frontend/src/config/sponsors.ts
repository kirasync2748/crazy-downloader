/**
 * ─────────────────────────────────────────────────────────────
 *  SPONSOR / AD CONFIGURATION
 * ─────────────────────────────────────────────────────────────
 *  To add or replace a sponsor, simply edit the `activeSponsor`
 *  object below. Set it to `null` when no sponsor is active and
 *  the ad area will show a "currently no sponsors" placeholder.
 *
 *  Fields:
 *    image     → path to the banner image in /public
 *    link      → URL opened in a new tab when the banner is clicked
 *    alt       → accessibility text for the banner image
 * ─────────────────────────────────────────────────────────────
 */

export interface Sponsor {
  image: string;
  link: string;
  alt: string;
}

/** The currently active sponsor. Set to `null` to show the "no sponsors" placeholder. */
export const activeSponsor: Sponsor | null = null;

/** Email or contact link shown in the "no sponsors" placeholder. */
export const sponsorContactLink = "mailto:#";
