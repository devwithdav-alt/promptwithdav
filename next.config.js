const csp = "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.paystack.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co https://*.paystack.co https://*.paystack.com; frame-src https://*.paystack.com https://*.paystack.co https://www.youtube-nocookie.com; media-src 'self' https: data: blob:; base-uri 'self'; object-src 'none'; form-action 'self'";
module.exports = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    const h = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
    ];
    if (process.env.NODE_ENV === "production") h.push({ key: "Content-Security-Policy", value: csp });
    return [{ source: "/(.*)", headers: h }];
  },
};
