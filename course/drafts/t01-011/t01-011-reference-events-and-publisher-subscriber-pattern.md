<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# delegates events lambdas closures and expression trees — Reference: Event declarations, accessors, event patterns, subscription lifetime

*This is an automatically generated draft.*

# Scope and version
This lesson covers the C# event system and the publisher-subscriber pattern as of C# 15 / .NET 11 (checked 2026-11-14). It focuses on the mechanics of declaring, subscribing to, and managing the lifecycle of events.

Source: [Microsoft C# Events Overview](https://learn.microsoft.com/en-us/dotnet/csharp/events-overview)

# How this group fits the mental model
In C#, an **event** is a mechanism that allows an object (the **Publisher**) to notify other objects (the **Subscribers**) when something happens. While a `delegate` is a type-safe object representing a method, an `event` adds a layer of protection: it restricts external code so it can only add or remove handlers, preventing outsiders from clearing the entire invocation list or triggering the event themselves.

# Supplied names explained

* `Field-like event`: A shorthand syntax where the compiler automatically generates the backing delegate field and the necessary `add`/`remove` accessors.
* `Event declaration`: The syntax used to define an event member within a class or struct, typically using a delegate type.
* `Event member access restrictions`: For field-like events, code outside the declaring type can subscribe or unsubscribe but cannot invoke or assign the event. Custom event accessors define their own behavior.
* `Event add accessor`: A custom block of code that defines what happens when a subscriber attaches to the event.
* `Event remove accessor`: A custom block of code that defines what happens when a subscriber detaches from the event.
* `Custom event`: An event that provides explicit `add` and `remove` accessors instead of relying on the compiler-generated field-like implementation.
* `Event subscription operator +=`: The syntax used by a subscriber to add a method to the event's invocation list.
* `Event unsubscription operator -=`: The syntax used by a subscriber to remove a method from the event's invocation list.
* `Event invocation by declaring type`: The act of calling the event delegate, which triggers all subscribed methods; this is only permitted inside the class that declared the event.
* `EventHandler`: A built-in delegate type for events that do not carry extra data.
* `EventHandler<TEventArgs>`: A generic delegate type for event handlers with a sender and event-data argument; modern .NET signatures permit type arguments beyond EventArgs, while traditional event-pattern APIs commonly use EventArgs-derived classes.
* `EventArgs`: The base class for classes containing event data.
* `Custom EventArgs type`: A class inheriting from `EventArgs` used to pass specific information to subscribers.
* `Event sender parameter`: The first argument in an event handler, representing the object that raised the event.
* `Event handler method`: A method that matches the signature of the event's delegate and is executed when the event is raised.
* `Event naming convention`: The standard practice of naming events with a verb or verb phrase (e.g., `ThresholdReached`).
* `On-prefixed raising method convention`: The practice of creating a protected virtual method named `OnEventName` to raise the event, allowing derived classes to override the notification logic.
* `Nullable event delegate`: The underlying delegate field of an event, which can be `null` if no subscribers are attached.
* `Null-conditional event invocation`: Using `?.Invoke()` on a field-like event to conditionally invoke its current delegate snapshot when non-null.
* `Publisher and subscriber roles`: The architectural separation where the publisher defines and raises the event, and the subscriber listens and reacts.
* `Observer pattern event implementation`: The standard C# realization of the Observer design pattern using events.
* `Event subscription lifetime`: The duration for which a subscriber is attached to a publisher.
* `Unsubscribe to avoid object retention`: The practice of detaching handlers to ensure the garbage collector can reclaim memory.
* `Store handler instance for unsubscription`: Saving a reference to a method (or lambda) so it can be passed to `-=` later.
* `Anonymous handler unsubscription problem`: The inability to unsubscribe a lambda expression if it was not stored in a variable, as the compiler creates a new instance each time.
* `EventHandler<TEventArgs> generic event pattern`: A common event-pattern shape `(object? sender, TEventArgs e)`; exact nullable annotations and EventArgs constraints depend on target framework/API version.
* `CancelEventArgs`: A specialized `EventArgs` class used for events that allow subscribers to cancel an operation.
* `PropertyChangedEventHandler`: A specific delegate type used for property change notifications.
* `INotifyPropertyChanged`: An interface that uses the `PropertyChanged` event to notify clients of property value changes.
* `Event thread-safety policy`: Field-like event add/remove accessors are thread-safe under the language specification. Custom accessors must define their own policy. A field-like event’s `?.Invoke` uses a safe delegate snapshot, but this does not make handler code or surrounding state thread-safe.

# Cross-item comparison
* **Delegate vs. Event**: A delegate is a type; an event is a member that wraps a delegate to provide access control.
* **Multicast delegate vs. Event subscription**: A multicast delegate is the underlying mechanism; event subscription is the controlled interface to that mechanism.

# Examples
```csharp
// Simple event usage
public class Counter {
    public event EventHandler ThresholdReached; // Field-like event

    protected virtual void OnThresholdReached(EventArgs e) {
        ThresholdReached?.Invoke(this, e); // Null-conditional invocation
    }
}
```

# Common mistakes
* **Memory Leaks**: Failing to use the `Event unsubscription operator -=` when a subscriber's lifetime is shorter than the publisher's. This keeps the subscriber alive in memory.
* **Anonymous Handler Unsubscription**: Writing `obj.Event += (s, e) => { ... };` and then trying to unsubscribe with a new lambda; the compiler treats these as different objects.
* **Thread Safety**: With field-like events, `?.Invoke` uses a safe delegate snapshot for null handling. Custom events or custom dispatch state may require explicit synchronization; thread safety of handler add/remove does not make handlers or the publisher’s state thread-safe.

# Knowledge checks with answers
1. **Question**: Why should you store a handler in a variable before subscribing?
   **Answer**: To ensure you have a reference to the exact same method instance to pass to the `-=` operator for unsubscription.
2. **Question**: Can an external class raise an event?
   **Answer**: No, `Event member access restrictions` ensure that only the declaring type can invoke the event.
3. **Question**: What is the purpose of `On-prefixed raising method convention`?
   **Answer**: It provides a protected, overridable entry point for derived classes to trigger or customize the event-raising logic.
