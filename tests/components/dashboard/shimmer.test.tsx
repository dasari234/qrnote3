import { RecentQrShimmer } from '@/app/dashboard/shimmer/recent-qr-shimmer';
import { DashboardStatsShimmer } from '@/app/dashboard/shimmer/stats-shimmer';
import { render } from '@testing-library/react';


describe('Dashboard loading states', () => {
  it('renders stats shimmer', () => {
    const { getByLabelText } = render(<DashboardStatsShimmer />);

    expect(
      getByLabelText(
        'Loading dashboard statistics'
      )
    ).toBeInTheDocument();
  });

  it('renders recent QR shimmer', () => {
    const { getByLabelText } = render(
      <RecentQrShimmer rows={5} />
    );

    expect(
      getByLabelText(
        'Loading recent QR codes'
      )
    ).toBeInTheDocument();
  });
});
