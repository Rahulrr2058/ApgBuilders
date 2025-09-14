import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Sites from "./pages/Sites";
import AddSite from "./pages/AddSite";
import EditSite from "./pages/EditSite";
import Vendors from "./pages/Vendors";
import AddVendor from "./pages/AddVendor";
import EditVendor from "./pages/EditVendor";
import Workers from "./pages/Workers";
import AddWorker from "./pages/AddWorker";
import EditWorker from "./pages/EditWorker";
import Expenses from "./pages/Expenses";
import AddExpense from "./pages/AddExpense";
import EditExpense from "./pages/EditExpense";
import WorkerPayments from "./pages/WorkerPayments";
import AddWorkerPayment from "./pages/AddWorkerPayment";
import EditWorkerPayment from "./pages/EditWorkerPayment";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sites" element={<Sites />} />
            <Route path="/sites/add" element={<AddSite />} />
            <Route path="/sites/edit/:id" element={<EditSite />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/vendors/add" element={<AddVendor />} />
            <Route path="/vendors/edit/:id" element={<EditVendor />} />
            <Route path="/workers" element={<Workers />} />
            <Route path="/workers/add" element={<AddWorker />} />
            <Route path="/workers/edit/:id" element={<EditWorker />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/expenses/add" element={<AddExpense />} />
            <Route path="/expenses/edit/:id" element={<EditExpense />} />
            <Route path="/worker-payments" element={<WorkerPayments />} />
            <Route path="/worker-payments/add" element={<AddWorkerPayment />} />
            <Route path="/worker-payments/edit/:id" element={<EditWorkerPayment />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
