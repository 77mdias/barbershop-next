import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ReviewForm } from "@/components/ReviewForm";

// Mock server actions
jest.mock("@/server/reviewActions", () => ({
  createReview: jest.fn(),
  updateReview: jest.fn(),
}));

// Get mocked functions
import * as reviewActions from "@/server/reviewActions";
const mockCreateReview = reviewActions.createReview as jest.MockedFunction<typeof reviewActions.createReview>;
const mockUpdateReview = reviewActions.updateReview as jest.MockedFunction<typeof reviewActions.updateReview>;

// Mock toast utilities
jest.mock("@/lib/toast-utils", () => ({
  showToast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}));

// Get mocked toast
import * as toastUtils from "@/lib/toast-utils";
const mockShowToast = toastUtils.showToast as jest.Mocked<typeof toastUtils.showToast>;

describe("ReviewForm", () => {
  const defaultProps = {
    serviceHistoryId: "test-service-history-id",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateReview.mockResolvedValue({
      success: true,
      message: "Review created successfully",
      data: {},
    });
  });

  test("renders review form with rating stars", () => {
    render(<ReviewForm {...defaultProps} />);

    expect(screen.getByText("Nova Avaliação")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(7); // 5 stars + upload button + submit button
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
      expect(mockShowToast.success).toHaveBeenCalledWith(
        "Avaliação salva!",
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
      expect(mockShowToast.error).toHaveBeenCalledWith(
        "Erro ao salvar",
        "Something went wrong"
      );
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
