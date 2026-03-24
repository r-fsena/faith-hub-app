import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, Dimensions, Image, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

type Product = {
  id: string;
  title: string;
  category: string;
  price: number;
  image: string;
  stock: number;
};

const mockProducts: Product[] = [
  { id: 'p1', title: 'Camiseta Leão de Judá', category: 'Vestuário', price: 69.90, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400', stock: 15 },
  { id: 'p2', title: 'Bíblia de Estudo Premium', category: 'Livros', price: 149.90, image: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&q=80&w=400', stock: 5 },
  { id: 'p3', title: 'Squeeze Graça Sobre Graça', category: 'Acessórios', price: 39.90, image: 'https://images.unsplash.com/photo-1518172023537-88544e4bf7e9?auto=format&fit=crop&q=80&w=400', stock: 20 },
  { id: 'p4', title: 'Boné Fé (Aba Reta)', category: 'Vestuário', price: 49.90, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=400', stock: 8 },
  { id: 'p5', title: 'Devocional Anual', category: 'Livros', price: 59.90, image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400', stock: 12 },
  { id: 'p6', title: 'Caneca Eu Faço Parte', category: 'Acessórios', price: 29.90, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=400', stock: 30 },
];

const categories = ['Todos', 'Vestuário', 'Livros', 'Acessórios'];

export default function StoreScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Navigation states internally to not lose volatile cart context
  const [currentView, setCurrentView] = useState<'catalog' | 'cart' | 'checkout' | 'success' | 'orders' | 'orderDetail'>('catalog');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Filter
  const [activeCategory, setActiveCategory] = useState('Todos');

  // Cart
  type CartItem = { product: Product; quantity: number };
  const [cart, setCart] = useState<CartItem[]>([]);

  // Checkout info
  const [deliveryMethod, setDeliveryMethod] = useState<'church' | 'home'>('church');
  const [pickupDay, setPickupDay] = useState<'Sexta-feira' | 'Domingo' | null>(null);
  const [address, setAddress] = useState('');
  
  // Payment Simulator
  const [isPixPaid, setIsPixPaid] = useState(false);

  // Orders Data
  const [orders, setOrders] = useState<any[]>([
    { 
      id: 'ORD-9821', date: '10 Nov 2025', status: 'ENTREGUE', total: 119.80, items: 2, 
      itemsDetail: [ { name: 'Camiseta Leão de Judá', qty: 1, price: 69.90 }, { name: 'Boné Fé', qty: 1, price: 49.90 } ],
      delivery: 'Retirar na Igreja',
    },
  ]);

  const bgColor = isDark ? '#1a2130' : '#f1f1f1';
  const cardColor = isDark ? '#2c3444' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#11181C';
  const textMuted = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#404c60' : '#EAEAEA';
  const primaryBrand = '#5bc3bb';
  const accentColor = '#0a7ea4';

  const formatPrice = (price: number) => `R$ ${price.toFixed(2).replace('.', ',')}`;

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter(item => item.product.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filterProducts = activeCategory === 'Todos' ? mockProducts : mockProducts.filter(p => p.category === activeCategory);

  const confirmOrder = () => {
    // Save to Orders
    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'RECEBIDO E PREPARANDO',
      total: cartTotal,
      items: cartItemCount,
      itemsDetail: cart.map(c => ({ name: c.product.title, qty: c.quantity, price: c.product.price })),
      delivery: deliveryMethod === 'home' ? `Em Casa - ${address}` : `Retirada - ${pickupDay}`
    };
    setOrders([newOrder, ...orders]);
    // Clear
    setIsPixPaid(false);
    setCart([]);
    setDeliveryMethod('church');
    setPickupDay(null);
    setCurrentView('success');
  };

  const renderHeader = (title: string, backAction: () => void, rightAction?: React.ReactNode) => (
    <View style={[styles.header, { borderBottomColor: borderColor }]}>
      <TouchableOpacity onPress={backAction} style={styles.headerBtn}>
        <Feather name="arrow-left" size={24} color={textColor} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: textColor }]}>{title}</Text>
      <View style={styles.headerBtn}>
        {rightAction}
      </View>
    </View>
  );

  if (currentView === 'catalog') {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
          {renderHeader('Loja da Igreja', () => router.back(), (
            <TouchableOpacity onPress={() => setCurrentView('orders')}>
              <Feather name="list" size={24} color={textColor} />
            </TouchableOpacity>
          ))}
          
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Categories */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
              {categories.map(cat => (
                <TouchableOpacity 
                  key={cat} 
                  style={[styles.catBadge, { backgroundColor: activeCategory === cat ? primaryBrand : cardColor }]}
                  onPress={() => setActiveCategory(cat)}
                >
                  <Text style={[styles.catText, { color: activeCategory === cat ? '#FFF' : textColor }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.productGrid}>
              {filterProducts.map(product => (
                <View key={product.id} style={[styles.productCard, { backgroundColor: cardColor }]}>
                  <Image source={{ uri: product.image }} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <Text style={[styles.productCategory, { color: primaryBrand }]}>{product.category}</Text>
                    <Text style={[styles.productTitle, { color: textColor }]} numberOfLines={2}>{product.title}</Text>
                    <Text style={[styles.productPrice, { color: textColor }]}>{formatPrice(product.price)}</Text>
                  </View>
                  <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(product)}>
                    <Text style={styles.addBtnText}>Adicionar</Text>
                    <Feather name="plus" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

          </ScrollView>

          {/* Floating Cart Panel */}
          {cartItemCount > 0 && (
            <View style={[styles.floatingCart, { backgroundColor: cardColor, borderTopColor: borderColor }]}>
              <View>
                <Text style={[styles.cartTotalLabel, { color: textMuted }]}>{cartItemCount} item{cartItemCount > 1 && 's'}</Text>
                <Text style={[styles.cartTotalValue, { color: textColor }]}>{formatPrice(cartTotal)}</Text>
              </View>
              <TouchableOpacity style={styles.checkoutBtn} onPress={() => setCurrentView('cart')}>
                <Text style={styles.checkoutBtnText}>Ver Carrinho</Text>
                <Feather name="shopping-bag" size={18} color="#FFF" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </>
    );
  }

  if (currentView === 'cart') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        {renderHeader('Meu Carrinho', () => setCurrentView('catalog'))}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {cart.length === 0 ? (
             <View style={{ alignItems: 'center', marginTop: 100 }}>
               <Feather name="shopping-cart" size={48} color={textMuted} />
               <Text style={{ color: textMuted, marginTop: 16 }}>Seu carrinho está vazio.</Text>
             </View>
          ) : (
             <>
                {cart.map(item => (
                  <View key={item.product.id} style={[styles.cartItem, { backgroundColor: cardColor }]}>
                    <Image source={{ uri: item.product.image }} style={styles.cartItemImg} />
                    <View style={styles.cartItemInfo}>
                      <Text style={[styles.cartItemTitle, { color: textColor }]} numberOfLines={2}>{item.product.title}</Text>
                      <Text style={[styles.cartItemPrice, { color: textColor }]}>{formatPrice(item.product.price)}</Text>
                      <Text style={[styles.cartItemQty, { color: textMuted }]}>Qtd: {item.quantity}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeFromCart(item.product.id)}>
                      <Feather name="trash-2" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ))}
             </>
          )}
        </ScrollView>
        {cartItemCount > 0 && (
          <View style={[styles.floatingCart, { backgroundColor: cardColor, borderTopColor: borderColor }]}>
            <View>
              <Text style={[styles.cartTotalLabel, { color: textMuted }]}>Total da Compra</Text>
              <Text style={[styles.cartTotalValue, { color: textColor }]}>{formatPrice(cartTotal)}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={() => setCurrentView('checkout')}>
              <Text style={styles.checkoutBtnText}>Continuar</Text>
              <Feather name="arrow-right" size={18} color="#FFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  if (currentView === 'checkout') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        {renderHeader('Finalizar Compra', () => setCurrentView('cart'))}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <Text style={[styles.sectionTitle, { color: textColor }]}>Como deseja receber?</Text>
          <View style={styles.deliveryOptions}>
            <TouchableOpacity 
              style={[styles.deliveryOpt, { backgroundColor: cardColor, borderColor: deliveryMethod === 'church' ? primaryBrand : borderColor }]}
              onPress={() => setDeliveryMethod('church')}
            >
              <Feather name="map-pin" size={24} color={deliveryMethod === 'church' ? primaryBrand : textMuted} />
              <Text style={[styles.deliveryOptText, { color: textColor }]}>Retirar na Igreja</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.deliveryOpt, { backgroundColor: cardColor, borderColor: deliveryMethod === 'home' ? primaryBrand : borderColor }]}
              onPress={() => setDeliveryMethod('home')}
            >
              <Feather name="truck" size={24} color={deliveryMethod === 'home' ? primaryBrand : textMuted} />
              <Text style={[styles.deliveryOptText, { color: textColor }]}>Receber em Casa</Text>
            </TouchableOpacity>
          </View>

          {deliveryMethod === 'church' && (
            <View style={[styles.subpanel, { backgroundColor: cardColor, borderColor }]}>
              <Text style={[styles.subpanelTitle, { color: textColor }]}>Selecione o Dia para Retirada</Text>
              <TouchableOpacity onPress={() => setPickupDay('Sexta-feira')} style={[styles.radioItem, { backgroundColor: pickupDay === 'Sexta-feira' ? `${primaryBrand}15` : 'transparent' }]}>
                <Feather name={pickupDay === 'Sexta-feira' ? 'check-circle' : 'circle'} size={20} color={pickupDay === 'Sexta-feira' ? primaryBrand : textMuted} />
                <Text style={{ marginLeft: 12, color: textColor, fontWeight: '600' }}>Culto de Sexta (19h30 - 21h30)</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPickupDay('Domingo')} style={[styles.radioItem, { backgroundColor: pickupDay === 'Domingo' ? `${primaryBrand}15` : 'transparent' }]}>
                <Feather name={pickupDay === 'Domingo' ? 'check-circle' : 'circle'} size={20} color={pickupDay === 'Domingo' ? primaryBrand : textMuted} />
                <Text style={{ marginLeft: 12, color: textColor, fontWeight: '600' }}>Culto de Domingo (18h00 - 20h30)</Text>
              </TouchableOpacity>
            </View>
          )}

          {deliveryMethod === 'home' && (
            <View style={[styles.subpanel, { backgroundColor: cardColor, borderColor }]}>
              <Text style={[styles.subpanelTitle, { color: textColor }]}>Endereço de Entrega</Text>
              <TextInput 
                style={[styles.input, { borderColor, color: textColor, backgroundColor: bgColor }]}
                placeholder="Rua, Número, Bairro, Cidade, CEP..."
                placeholderTextColor={textMuted}
                value={address}
                onChangeText={setAddress}
                multiline
              />
              <Text style={{ color: textMuted, fontSize: 12, marginTop: 8 }}>Taxas de entrega serão comunicadas diretamente no seu WhatsApp antes do envio.</Text>
            </View>
          )}

          <Text style={[styles.sectionTitle, { color: textColor, marginTop: 32 }]}>Pagamento via PIX</Text>
          <View style={[styles.pixCard, { backgroundColor: cardColor, borderColor }]}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={styles.qrCodeMock}>
                <Feather name="maximize" size={48} color={textMuted} />
                <Text style={{ color: textMuted, fontSize: 10, marginTop: 8 }}>QR CODE PIX</Text>
              </View>
              <Text style={[styles.pixValue, { color: textColor }]}>{formatPrice(cartTotal)}</Text>
            </View>

            <TouchableOpacity style={styles.copyPixBtn}>
              <Feather name="copy" size={18} color="#FFF" />
              <Text style={{ color: '#FFF', fontWeight: '700', marginLeft: 8 }}>Copiar Pix Copia e Cola</Text>
            </TouchableOpacity>

            {!isPixPaid ? (
              <TouchableOpacity style={[styles.validatePixBtn, { borderColor }]} onPress={() => setIsPixPaid(true)}>
                <Feather name="refresh-cw" size={16} color={textMuted} />
                <Text style={[styles.validatePixText, { color: textMuted }]}>Simular Pagamento Aprovado</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.paidSuccess}>
                <Feather name="check-circle" size={24} color="#00C464" />
                <Text style={{ color: '#00C464', fontWeight: '800', marginLeft: 8, fontSize: 16 }}>Pagamento Validado!</Text>
              </View>
            )}
          </View>

        </ScrollView>
        {isPixPaid && (deliveryMethod === 'home' ? address : pickupDay) && (
          <View style={[styles.floatingCart, { backgroundColor: cardColor, borderTopColor: borderColor }]}>
            <TouchableOpacity style={[styles.checkoutBtn, { flex: 1, backgroundColor: '#00C464' }]} onPress={confirmOrder}>
              <Text style={styles.checkoutBtnText}>Confirmar Pedido</Text>
              <Feather name="check" size={18} color="#FFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  if (currentView === 'success') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(0,196,100,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
          <Feather name="check" size={48} color="#00C464" />
        </View>
        <Text style={{ fontSize: 24, fontWeight: '900', color: textColor, marginBottom: 8, textAlign: 'center' }}>Pedido Confirmado!</Text>
        <Text style={{ fontSize: 16, color: textMuted, textAlign: 'center', marginBottom: 40, paddingHorizontal: 20 }}>
          Seu pedido foi recebido com sucesso e estamos preparando tudo com carinho. Acompanhe o status de preparo.
        </Text>
        
        <TouchableOpacity 
          style={{ backgroundColor: primaryBrand, paddingHorizontal: 32, paddingVertical: 18, borderRadius: 30, width: '100%', alignItems: 'center', marginBottom: 16 }}
          onPress={() => setCurrentView('orders')}
        >
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '800' }}>Ver Meus Pedidos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={{ paddingHorizontal: 32, paddingVertical: 18, borderRadius: 30, width: '100%', alignItems: 'center' }}
          onPress={() => setCurrentView('catalog')}
        >
          <Text style={{ color: textMuted, fontSize: 16, fontWeight: '700' }}>Voltar para a Loja</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (currentView === 'orders') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        {renderHeader('Meus Pedidos', () => setCurrentView('catalog'))}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {orders.map(order => (
            <TouchableOpacity key={order.id} style={[styles.orderCard, { backgroundColor: cardColor }]} onPress={() => { setSelectedOrder(order); setCurrentView('orderDetail'); }} activeOpacity={0.8}>
              <View style={styles.orderHeader}>
                 <Text style={[styles.orderId, { color: textColor }]}>Pedido #{order.id}</Text>
                 <View style={[styles.orderStatusBadge, { backgroundColor: order.status === 'ENTREGUE' ? '#00C46415' : 'rgba(255, 149, 0, 0.1)' }]}>
                   <Text style={{ color: order.status === 'ENTREGUE' ? '#00C464' : '#FF9500', fontWeight: '800', fontSize: 10 }}>{order.status}</Text>
                 </View>
              </View>
              <View style={styles.orderFooter}>
                 <Text style={[styles.orderInfo, { color: textMuted }]}>{order.date} • {order.items} itens</Text>
                 <Text style={[styles.orderTotal, { color: textColor }]}>{formatPrice(order.total)}</Text>
              </View>
              <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: borderColor, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Text style={{ color: primaryBrand, fontWeight: '700', fontSize: 13, marginRight: 8 }}>Ver Detalhes do Pedido</Text>
                <Feather name="chevron-right" size={16} color={primaryBrand} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentView === 'orderDetail' && selectedOrder) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        {renderHeader(`Detalhes #${selectedOrder.id}`, () => setCurrentView('orders'))}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.subpanel, { backgroundColor: cardColor, borderColor }]}>
            <Text style={[styles.subpanelTitle, { color: textColor }]}>Status Atual</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="package" size={24} color={selectedOrder.status === 'ENTREGUE' ? '#00C464' : '#FF9500'} />
              <Text style={{ marginLeft: 12, color: textColor, fontWeight: '700', fontSize: 16 }}>{selectedOrder.status}</Text>
            </View>
            <Text style={{ color: textMuted, marginTop: 12, fontSize: 13 }}>Método de Recebimento: {selectedOrder.delivery}</Text>
          </View>

          <Text style={[styles.sectionTitle, { color: textColor, marginTop: 16 }]}>Itens Comprados</Text>
          <View style={[styles.listContainer, { backgroundColor: cardColor }]}>
             {selectedOrder.itemsDetail.map((itm: any, idx: number) => (
                <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: idx === selectedOrder.itemsDetail.length - 1 ? 0 : 1, borderBottomColor: borderColor }}>
                   <View style={{ flex: 1, marginRight: 16 }}>
                     <Text style={{ color: textColor, fontWeight: '600' }}>{itm.qty}x {itm.name}</Text>
                   </View>
                   <Text style={{ color: textColor, fontWeight: '800' }}>{formatPrice(itm.price * itm.qty)}</Text>
                </View>
             ))}
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                <Text style={{ color: textMuted, fontWeight: '600' }}>Total Pago Via PIX</Text>
                <Text style={{ color: primaryBrand, fontWeight: '900', fontSize: 18 }}>{formatPrice(selectedOrder.total)}</Text>
             </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 16, borderBottomWidth: 1 },
  headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  
  // Catalog
  catScroll: { flexDirection: 'row', marginBottom: 24, maxHeight: 40 },
  catBadge: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginRight: 12, justifyContent: 'center', height: 38 },
  catText: { fontSize: 14, fontWeight: '700' },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 60 },
  productCard: { width: '48%', borderRadius: 16, overflow: 'hidden', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  productImage: { width: '100%', height: 160, backgroundColor: '#EAEAEA' },
  productInfo: { padding: 12 },
  productCategory: { fontSize: 10, fontWeight: '800', marginBottom: 4, textTransform: 'uppercase' },
  productTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8, height: 40 },
  productPrice: { fontSize: 16, fontWeight: '900' },
  addBtn: { backgroundColor: '#5bc3bb', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  addBtnText: { color: '#FFF', fontWeight: '800', marginRight: 6 },
  
  // Floating Cart
  floatingCart: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartTotalLabel: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  cartTotalValue: { fontSize: 22, fontWeight: '900' },
  checkoutBtn: { backgroundColor: '#5bc3bb', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30 },
  checkoutBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  
  // Cart Items
  cartItem: { flexDirection: 'row', padding: 16, borderRadius: 16, marginBottom: 16, alignItems: 'center' },
  cartItemImg: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#EAEAEA', marginRight: 16 },
  cartItemInfo: { flex: 1 },
  cartItemTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  cartItemPrice: { fontSize: 16, fontWeight: '900', marginBottom: 4 },
  cartItemQty: { fontSize: 12, fontWeight: '600' },
  
  // Checkout
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  deliveryOptions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  deliveryOpt: { flex: 1, alignItems: 'center', padding: 20, borderRadius: 16, borderWidth: 2, marginHorizontal: 6 },
  deliveryOptText: { marginTop: 12, fontWeight: '700', fontSize: 14 },
  subpanel: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  subpanelTitle: { fontSize: 15, fontWeight: '800', marginBottom: 16 },
  radioItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, minHeight: 80, fontSize: 15 },
  
  pixCard: { padding: 24, borderRadius: 24, borderWidth: 1, alignItems: 'center' },
  qrCodeMock: { width: 150, height: 150, borderWidth: 2, borderStyle: 'dashed', borderColor: '#CCC', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  pixValue: { fontSize: 32, fontWeight: '900', marginTop: 16 },
  copyPixBtn: { backgroundColor: '#0a7ea4', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 30, width: '100%', justifyContent: 'center', marginBottom: 16 },
  validatePixBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderWidth: 1, borderStyle: 'dashed', borderRadius: 30, width: '100%' },
  validatePixText: { fontWeight: '700', marginLeft: 8 },
  paidSuccess: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: 'rgba(0,196,100,0.1)', borderRadius: 16, width: '100%' },
  
  // Orders
  orderCard: { padding: 20, borderRadius: 16, marginBottom: 16 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  orderId: { fontSize: 16, fontWeight: '800' },
  orderStatusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderInfo: { fontSize: 13, fontWeight: '600' },
  orderTotal: { fontSize: 18, fontWeight: '900' },
  listContainer: { borderRadius: 16, overflow: 'hidden' }
});
