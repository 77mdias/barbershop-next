import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ReviewForm } from "@/components/ReviewForm";

// Mock server actions
const mockCreateReview = jest.fn();
const mockUpdateReview = jest.fn();

jest.mock("@/server/reviewActions", () => ({
  createReview: mockCreateReview,
  updateReview: mockUpdateReview,
}));

// Mock toast
const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
};
jest.mock("sonner", () => ({
  toast: mockToast,
}));

describe("ReviewForm", () => {
  const defaultProps = {
    serviceHistoryId: "test-service-history-id",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateReview.mockResolvedValue({
      success: true,
      message: "Review created successfully",
    });
  });

  test("renders review form with rating stars", () => {
    render(<ReviewForm {...defaultProps} />);

    expect(screen.getByText("Avaliar Serviço")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(6); // 5 stars + submit button
  });

  test("allows user to select rating", async () => {
    render(<ReviewForm {...defaultProps} />);

    const fourthStar = screen.getAllByRole("button")[3]; // 4th star (0-indexed)
    fireEvent.click(fourthStar);

    // Check if submit button is enabled after selecting rating
    const submitButton = screen.getByRole("button", {
      name: /enviar avaliação/i,
    });
    expect(submitButton).not.toBeDisabled();
  });

  test("allows user to add feedback text", async () => {
    render(<ReviewForm {...defaultProps} />);

    const textArea = screen.getByPlaceholderText(
      /compartilhe sua experiência/i
    );
    fireEvent.change(textArea, { target: { value: "Great service!" } });

    expect(textArea).toHaveValue("Great service!");
  });

  test("submits form with correct data", async () => {
    render(<ReviewForm {...defaultProps} />);

    // Select rating
    const fourthStar = screen.getAllByRole("button")[3];
    fireEvent.click(fourthStar);

    // Add feedback
    const textArea = screen.getByPlaceholderText(
      /compartilhe sua experiência/i
    );
    fireEvent.change(textArea, { target: { value: "Excellent service!" } });

    // Submit form
    const submitButton = screen.getByRole("button", {
      name: /enviar avaliação/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateReview).toHaveBeenCalledWith({
        serviceHistoryId: "test-service-history-id",
        rating: 4,
        feedback: "Excellent service!",
        images: [],
      });
    });
  });

  test("shows success toast on successful submission", async () => {
    render(<ReviewForm {...defaultProps} />);

    // Select rating and submit
    const fourthStar = screen.getAllByRole("button")[3];
    fireEvent.click(fourthStar);

    const submitButton = screen.getByRole("button", {
      name: /enviar avaliação/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        "Review created successfully"
      );
    });
  });

  test("shows error toast on submission failure", async () => {
    mockCreateReview.mockResolvedValue({
      success: false,
      error: "Something went wrong",
    });

    render(<ReviewForm {...defaultProps} />);

    // Select rating and submit
    const fourthStar = screen.getAllByRole("button")[3];
    fireEvent.click(fourthStar);

    const submitButton = screen.getByRole("button", {
      name: /enviar avaliação/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });

  test("disables submit button when no rating is selected", () => {
    render(<ReviewForm {...defaultProps} />);

    const submitButton = screen.getByRole("button", {
      name: /enviar avaliação/i,
    });
    expect(submitButton).toBeDisabled();
  });
});
