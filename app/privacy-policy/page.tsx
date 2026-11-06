import { PageHero } from '@/components/PageHero';
import { pageMetadata } from '@/lib/site';

// TEMPLATE: have this reviewed by a qualified professional and update it once the
// email, contact form, analytics and ordering providers are chosen.

export function generateMetadata() {
  return pageMetadata({ title: 'Privacy Policy | NEFRA', description: 'How NEFRA collects and uses information submitted through this website.', path: '/privacy-policy/' });
}

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" lead="Last updated: [date to be set at launch]" />
      <section className="py-section">
        <div className="container-site">
          <div className="prose-nefra">
            <p>This policy explains what information NEFRA (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects through this website and how we use it.</p>
            <h2>Information you give us</h2>
            <p>When you sign up for our email list or send us a message, we collect the details you provide, such as your name, email address and message. We use this information only to respond to you and, if you signed up, to send you NEFRA news. You can unsubscribe at any time using the link in any email.</p>
            <h2>Service providers</h2>
            <p>We use third-party services to host this website, deliver email and process online orders. These providers handle your information on our behalf under their own privacy policies. Online orders and payments are handled by our ordering partner, whose terms and privacy policy apply to that transaction. NEFRA&rsquo;s website never receives your payment card details.</p>
            <h2>Cookies and analytics</h2>
            <p>We may use Google Analytics to understand how visitors use this website, for example which pages are viewed and when an Order Online button is selected. Google Analytics uses cookies and collects information such as your browser, device and approximate location. [Confirm whether analytics is enabled and update this section.]</p>
            <h2>Sharing</h2>
            <p>We do not sell your personal information.</p>
            <h2>Contact</h2>
            <p>Questions about this policy can be sent through our <a href="/contact/">contact page</a>.</p>
          </div>
        </div>
      </section>
    </>
  );
}
